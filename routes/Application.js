const express = require('express');
const router = express.Router();
const application = require('../models/application.js');
const job = require('../models/job.js');
const user = require('../models/user.js');
const { protect, authorize } = require('../middlewares/authMiddleware.js');
const { sendApplicationConfirmation, sendApplicationStatusUpdate, sendInterviewScheduled } = require('../services/emailService.js');

/**
 * @swagger
 * /application:
 *   get:
 *     summary: Get applications (filtered by user role)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     description: |
 *       - Seekers: Get their own applications
 *       - Employers: Get applications for their jobs
 *       - Admins: Get all applications
 *     responses:
 *       200:
 *         description: List of applications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   jobId:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       category:
 *                         type: string
 *                   seekerId:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       resumeURL:
 *                         type: string
 *                   status:
 *                     type: string
 *                     enum: [pending, shortlisted, interview, accepted, rejected]
 *                   appliedDate:
 *                     type: string
 *                     format: date-time
 *                   interviewDate:
 *                     type: string
 *                     format: date-time
 *                   interviewType:
 *                     type: string
 *                     enum: [phone, video, inperson, email]
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', protect, async (req,res) => {
  try {
    // seekers see their applications; employers see applications for their jobs
    if (req.user.role === 'seeker') {
      const all = await application.find({ seekerId: req.user._id })
        .populate('jobId', 'title category employerId')
        .populate('seekerId', 'name email resumeURL');
      return res.status(200).json(all);
    }

    if (req.user.role === 'employer') {
      const jobs = await job.find({ employerId: req.user._id }, { _id: 1 });
      const jobIds = jobs.map(j => j._id);
      const all = await application.find({ jobId: { $in: jobIds } })
        .populate('jobId', 'title category employerId')
        .populate('seekerId', 'name email resumeURL');
      return res.status(200).json(all);
    }

    const all = await application.find({})
      .populate('jobId', 'title category')
      .populate('seekerId', 'name email');
    return res.status(200).json(all);
  } catch(err) {
    return res.status(500).json({ error: err.message});
  }
});

/**
 * @swagger
 * /application:
 *   post:
 *     summary: Submit job application (Seeker only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - jobId
 *             properties:
 *               jobId:
 *                 type: string
 *                 description: Job ID to apply for
 *               resumeURL:
 *                 type: string
 *                 description: Resume URL (optional, uses user's resume if not provided)
 *               coverLetter:
 *                 type: string
 *                 description: Cover letter text
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 application:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Seeker access required
 *       409:
 *         description: Already applied to this job
 *       500:
 *         description: Server error
 */
router.post('/', protect, authorize('seeker'), async (req,res) => {
  try {
    const { jobId, resumeURL, coverLetter } = req.body;
    const exists = await application.findOne({ jobId, seekerId: req.user._id });
    if (exists) return res.status(409).json({ error: 'Already applied to this job' });

    const Job = await job.findById(jobId);
    if (!Job) return res.status(404).json({ error: 'Job not found' });
    if (Job.status !== 'open') return res.status(400).json({ error: 'Job is no longer accepting applications' });

    const app = new application({
      jobId,
      seekerId: req.user._id,
      resumeURL: resumeURL || req.user.resumeURL,
      coverLetter
    });
    await app.save();

    // Send application confirmation email to seeker
    try {
      const seeker = await user.findById(req.user._id);
      const jobDetails = await job.findById(jobId).populate('employerId', 'name company');
      await sendApplicationConfirmation(seeker.email, {
        seekerName: seeker.name,
        jobTitle: jobDetails.title,
        companyName: jobDetails.employerId.company || jobDetails.employerId.name
      });
    } catch (emailError) {
      console.error('Failed to send application confirmation email:', emailError);
      // Don't fail the application submission if email fails
    }

    return res.status(201).json({ message: 'Application submitted', application: app });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /application/{id}/status:
 *   put:
 *     summary: Update application status (Employer only)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, shortlisted, interview, accepted, rejected]
 *                 description: New application status
 *               interviewDate:
 *                 type: string
 *                 format: date-time
 *                 description: Interview date/time (required if status is 'interview')
 *               interviewType:
 *                 type: string
 *                 enum: [phone, video, inperson, email]
 *                 description: Interview type
 *               feedback:
 *                 type: string
 *                 description: Feedback or notes
 *     responses:
 *       200:
 *         description: Application status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 application:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Employer access required
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */
router.put('/:id/status', protect, authorize('employer'), async (req, res) => {
  try {
    const app = await application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });

    const Job = await job.findById(app.jobId);
    if (!Job) return res.status(404).json({ error: 'Job not found' });
    if (String(Job.employerId) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { status, interviewDate, interviewType, feedback } = req.body;
    const oldStatus = app.status;

    if (status) app.status = status;
    if (interviewDate) app.interviewDate = interviewDate;
    if (interviewType) app.interviewType = interviewType;
    if (feedback) app.feedback = feedback;

    await app.save();

    // Send email notifications based on status change
    try {
      const seeker = await user.findById(app.seekerId);
      const jobDetails = await job.findById(app.jobId).populate('employerId', 'name company');

      if (status && status !== oldStatus) {
        if (status === 'interview') {
          // Send interview scheduled email
          await sendInterviewScheduled(seeker.email, {
            seekerName: seeker.name,
            jobTitle: jobDetails.title,
            companyName: jobDetails.employerId.company || jobDetails.employerId.name,
            interviewDate: interviewDate,
            interviewType: interviewType || 'phone'
          });
        } else {
          // Send status update email for other status changes
          await sendApplicationStatusUpdate(seeker.email, {
            seekerName: seeker.name,
            jobTitle: jobDetails.title,
            companyName: jobDetails.employerId.company || jobDetails.employerId.name,
            status: status,
            feedback: feedback
          });
        }
      }
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
      // Don't fail the status update if email fails
    }

    return res.status(200).json({ message: 'Updated', application: app });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /application/{id}:
 *   get:
 *     summary: Get application details by ID
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Application ID
 *     responses:
 *       200:
 *         description: Application details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Application not found
 *       500:
 *         description: Server error
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const app = await application.findById(req.params.id)
      .populate('jobId')
      .populate('seekerId', '-password');
    if (!app) return res.status(404).json({ error: 'Application not found' });

    // Check if user has permission to view this application
    const isSeeker = req.user.role === 'seeker' && String(app.seekerId._id) === String(req.user._id);
    const isEmployer = req.user.role === 'employer' && String(app.jobId.employerId) === String(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isSeeker && !isEmployer && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return res.status(200).json(app);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

router.get('/', protect, async (req,res) => {
  try {
    // seekers see their applications; employers see applications for their jobs
    if (req.user.role === 'seeker') {
      const all = await application.find({ seekerId: req.user._id })
        .populate('jobId', 'title category employerId')
        .populate('seekerId', 'name email resumeURL');
      return res.status(200).json(all);
    }

    if (req.user.role === 'employer') {
      const jobs = await job.find({ employerId: req.user._id }, { _id: 1 });
      const jobIds = jobs.map(j => j._id);
      const all = await application.find({ jobId: { $in: jobIds } })
        .populate('jobId', 'title category employerId')
        .populate('seekerId', 'name email resumeURL');
      return res.status(200).json(all);
    }

    const all = await application.find({})
      .populate('jobId', 'title category')
      .populate('seekerId', 'name email');
    return res.status(200).json(all);
  } catch(err) {
    return res.status(500).json({ error: err.message});
  }
});

router.post('/', protect, authorize('seeker'), async (req,res) => {
  try {
    const { jobId, resumeURL, coverLetter } = req.body;
    const exists = await application.findOne({ jobId, seekerId: req.user._id });
    if (exists) return res.status(409).json({ error: 'Already applied to this job' });

    const Job = await job.findById(jobId);
    if (!Job) return res.status(404).json({ error: 'Job not found' });
    if (Job.status !== 'open') return res.status(400).json({ error: 'Job is no longer accepting applications' });

    const app = new application({
      jobId,
      seekerId: req.user._id,
      resumeURL: resumeURL || req.user.resumeURL,
      coverLetter
    });
    await app.save();

    // Send application confirmation email to seeker
    try {
      const seeker = await user.findById(req.user._id);
      const jobDetails = await job.findById(jobId).populate('employerId', 'name company');
      await sendApplicationConfirmation(seeker.email, {
        seekerName: seeker.name,
        jobTitle: jobDetails.title,
        companyName: jobDetails.employerId.company || jobDetails.employerId.name
      });
    } catch (emailError) {
      console.error('Failed to send application confirmation email:', emailError);
      // Don't fail the application submission if email fails
    }

    return res.status(201).json({ message: 'Application submitted', application: app });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', protect, authorize('employer'), async (req, res) => {
  try {
    const app = await application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });

    const Job = await job.findById(app.jobId);
    if (!Job) return res.status(404).json({ error: 'Job not found' });
    if (String(Job.employerId) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { status, interviewDate, interviewType, feedback } = req.body;
    const oldStatus = app.status;

    if (status) app.status = status;
    if (interviewDate) app.interviewDate = interviewDate;
    if (interviewType) app.interviewType = interviewType;
    if (feedback) app.feedback = feedback;

    await app.save();

    // Send email notifications based on status change
    try {
      const seeker = await user.findById(app.seekerId);
      const jobDetails = await job.findById(app.jobId).populate('employerId', 'name company');

      if (status && status !== oldStatus) {
        if (status === 'interview') {
          // Send interview scheduled email
          await sendInterviewScheduled(seeker.email, {
            seekerName: seeker.name,
            jobTitle: jobDetails.title,
            companyName: jobDetails.employerId.company || jobDetails.employerId.name,
            interviewDate: interviewDate,
            interviewType: interviewType || 'phone'
          });
        } else {
          // Send status update email for other status changes
          await sendApplicationStatusUpdate(seeker.email, {
            seekerName: seeker.name,
            jobTitle: jobDetails.title,
            companyName: jobDetails.employerId.company || jobDetails.employerId.name,
            status: status,
            feedback: feedback
          });
        }
      }
    } catch (emailError) {
      console.error('Failed to send status update email:', emailError);
      // Don't fail the status update if email fails
    }

    return res.status(200).json({ message: 'Updated', application: app });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;