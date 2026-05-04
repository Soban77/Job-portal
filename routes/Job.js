const express = require('express');
const router = express.Router();
const job = require('../models/job.js');
const { protect, authorize } = require('../middlewares/authMiddleware.js');
const { getCache, setCache, clearJobCache } = require('../cache');

/**
 * @swagger
 * /job:
 *   get:
 *     summary: Get all jobs with optional filtering and search
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, and category
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by job category
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         description: Filter by required skills (comma-separated)
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by job location
 *       - in: query
 *         name: jobType
 *         schema:
 *           type: string
 *           enum: [Full-time, Part-time, Contract, Temporary, Remote]
 *         description: Filter by job type
 *       - in: query
 *         name: experienceLevel
 *         schema:
 *           type: string
 *           enum: [Entry-level, Junior, Mid-level, Senior, Lead]
 *         description: Filter by experience level
 *       - in: query
 *         name: salaryMin
 *         schema:
 *           type: number
 *         description: Minimum salary filter
 *       - in: query
 *         name: salaryMax
 *         schema:
 *           type: number
 *         description: Maximum salary filter
 *     responses:
 *       200:
 *         description: List of jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 *         headers:
 *           X-Cache:
 *             description: Cache status (HIT or MISS)
 *             schema:
 *               type: string
 *       500:
 *         description: Server error
 */
router.get('/', async (req,res) => {
  try {
    const search = String(req.query.search || '').trim();
    const category = String(req.query.category || '').trim();
    const skills = String(req.query.skills || '').split(',').map(s => s.trim()).filter(Boolean);
    const location = String(req.query.location || '').trim();
    const jobType = String(req.query.jobType || '').trim();
    const experienceLevel = String(req.query.experienceLevel || '').trim();
    const salaryMin = req.query.salaryMin ? Number(req.query.salaryMin) : null;
    const salaryMax = req.query.salaryMax ? Number(req.query.salaryMax) : null;

    const query = { status: 'open' };

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { category: regex }
      ];
    }

    if (category) {
      query.category = new RegExp(category, 'i');
    }

    if (skills.length) {
      query.skillsRequired = { $all: skills };
    }

    if (location) {
      query.location = new RegExp(location, 'i');
    }

    if (jobType) {
      query.jobType = jobType;
    }

    if (experienceLevel) {
      query.experienceLevel = experienceLevel;
    }

    if (salaryMin !== null || salaryMax !== null) {
      query.salaryMin = {};
      if (salaryMin !== null) query.salaryMin.$gte = salaryMin;
      if (salaryMax !== null) query.salaryMin.$lte = salaryMax;
    }

    const cacheKey = `job:search:${search}:cat:${category}:skills:${skills.join(',')}:loc:${location}:type:${jobType}:exp:${experienceLevel}:sal:${salaryMin}-${salaryMax}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.status(200).json(cached);
    }

    const all = await job.find(query).sort({ postedDate: -1 });
    await setCache(cacheKey, all, 60);
    res.set('X-Cache', 'MISS');
    return res.status(200).json(all);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /job/my:
 *   get:
 *     summary: Get jobs posted by current employer
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of employer's jobs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Job'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Employer access required
 *       500:
 *         description: Server error
 */
router.get('/my', protect, authorize('employer'), async (req, res) => {
  try {
    const jobs = await job.find({ employerId: req.user._id }).sort({ postedDate: -1 });
    return res.status(200).json(jobs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /job:
 *   post:
 *     summary: Create new job posting (Employer only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 description: Job title
 *               description:
 *                 type: string
 *                 description: Job description
 *               category:
 *                 type: string
 *                 description: Job category
 *               skillsRequired:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Required skills
 *               location:
 *                 type: string
 *                 description: Job location
 *               jobType:
 *                 type: string
 *                 enum: [Full-time, Part-time, Contract, Temporary, Remote]
 *                 default: Full-time
 *                 description: Type of employment
 *               salaryMin:
 *                 type: number
 *                 description: Minimum salary
 *               salaryMax:
 *                 type: number
 *                 description: Maximum salary
 *               experienceLevel:
 *                 type: string
 *                 enum: [Entry-level, Junior, Mid-level, Senior, Lead]
 *                 default: Entry-level
 *                 description: Required experience level
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *                 description: Job expiry date
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 Job:
 *                   $ref: '#/components/schemas/Job'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Employer access required
 *       500:
 *         description: Server error
 */
router.post('/', protect, authorize('employer'), async (req, res) => {
  try {
    const Job = new job({ ...req.body, employerId: req.user._id });
    await Job.save();
    await clearJobCache();
    return res.status(201).json({ message: 'Successful', Job });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /job/{id}:
 *   get:
 *     summary: Get job details by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Job'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const Job = await job.findById(req.params.id);
    if (!Job) return res.status(404).json({ error: 'Job not found' });
    return res.status(200).json(Job);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /job/{id}:
 *   put:
 *     summary: Update job posting (Employer only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Job'
 *     responses:
 *       200:
 *         description: Job updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 Job:
 *                   $ref: '#/components/schemas/Job'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Employer access required
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.put('/:id', protect, authorize('employer'), async (req, res) => {
  try {
    const Job = await job.findById(req.params.id);
    if (!Job) return res.status(404).json({ error: 'Job not found' });
    if (String(Job.employerId) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    Object.assign(Job, req.body);
    await Job.save();
    await clearJobCache();
    return res.status(200).json({ message: 'Updated', Job });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /job/{id}:
 *   delete:
 *     summary: Delete job posting (Employer only)
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Employer access required
 *       404:
 *         description: Job not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', protect, authorize('employer'), async (req, res) => {
  try {
    const Job = await job.findById(req.params.id);
    if (!Job) return res.status(404).json({ error: 'Job not found' });
    if (String(Job.employerId) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await Job.deleteOne();
    await clearJobCache();
    return res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;

router.get('/', async (req,res) => {
  try {
    const search = String(req.query.search || '').trim();
    const category = String(req.query.category || '').trim();
    const skills = String(req.query.skills || '').split(',').map(s => s.trim()).filter(Boolean);
    const query = { status: 'open' };

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { category: regex }
      ];
    }

    if (category) {
      query.category = new RegExp(category, 'i');
    }

    if (skills.length) {
      query.skillsRequired = { $all: skills };
    }

    const cacheKey = `job:search:${search}:cat:${category}:skills:${skills.join(',')}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      res.set('X-Cache', 'HIT');
      return res.status(200).json(cached);
    }

    const all = await job.find(query).sort({ postedDate: -1 });
    await setCache(cacheKey, all, 60);
    res.set('X-Cache', 'MISS');
    return res.status(200).json(all);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/my', protect, authorize('employer'), async (req, res) => {
  try {
    const jobs = await job.find({ employerId: req.user._id }).sort({ postedDate: -1 });
    return res.status(200).json(jobs);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.post('/', protect, authorize('employer'), async (req, res) => {
  try {
    const Job = new job({ ...req.body, employerId: req.user._id });
    await Job.save();
    await clearJobCache();
    return res.status(201).json({ message: 'Successful', Job });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const Job = await job.findById(req.params.id);
    if (!Job) return res.status(404).json({ error: 'Job not found' });
    return res.status(200).json(Job);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.put('/:id', protect, authorize('employer'), async (req, res) => {
  try {
    const Job = await job.findById(req.params.id);
    if (!Job) return res.status(404).json({ error: 'Job not found' });
    if (String(Job.employerId) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    Object.assign(Job, req.body);
    await Job.save();
    await clearJobCache();
    return res.status(200).json({ message: 'Updated', Job });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', protect, authorize('employer'), async (req, res) => {
  try {
    const Job = await job.findById(req.params.id);
    if (!Job) return res.status(404).json({ error: 'Job not found' });
    if (String(Job.employerId) !== String(req.user._id)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await Job.deleteOne();
    await clearJobCache();
    return res.status(200).json({ message: 'Deleted' });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

module.exports = router;