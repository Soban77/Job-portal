const express = require('express');
const router = express.Router();
const employer = require('../models/employer.js');
const { protect, authorize } = require('../middlewares/authMiddleware.js');

/**
 * @swagger
 * /employer:
 *   get:
 *     summary: Get all employer profiles (Admin only)
 *     tags: [Employers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all employer profiles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   userId:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                   companyName:
 *                     type: string
 *                   companyProfile:
 *                     type: string
 *                   verificationStatus:
 *                     type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/', protect, authorize('admin'), async (req,res) => {
  try {
    const all = await employer.find({}).populate('userId', 'name email');
    return res.status(200).json(all);
  } catch(err) {
    return res.status(500).json({ error: err.message});
  }
});

/**
 * @swagger
 * /employer/{id}/verify:
 *   put:
 *     summary: Update employer verification status (Admin only)
 *     tags: [Employers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employer profile ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - verificationStatus
 *             properties:
 *               verificationStatus:
 *                 type: boolean
 *                 description: Verification status
 *     responses:
 *       200:
 *         description: Verification status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 employer:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       404:
 *         description: Employer profile not found
 *       500:
 *         description: Server error
 */
router.put('/:id/verify', protect, authorize('admin'), async (req, res) => {
  try {
    const profile = await employer.findById(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Employer profile not found' });
    profile.verificationStatus = Boolean(req.body.verificationStatus);
    await profile.save();
    return res.status(200).json({ message: 'Verification updated', employer: profile });
  } catch(err) {
    return res.status(500).json({ error: err.message});
  }
});

/**
 * @swagger
 * /employer/me:
 *   get:
 *     summary: Get current employer's profile
 *     tags: [Employers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current employer profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                   _id:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   companyName:
 *                     type: string
 *                   companyProfile:
 *                     type: string
 *                   verificationStatus:
 *                     type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Employer access required
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Server error
 */
router.get('/me', protect, authorize('employer'), async (req, res) => {
  try {
    const record = await employer.findOne({ userId: req.user._id });
    if (!record) return res.status(404).json({ error: 'Employer profile not found' });
    return res.status(200).json(record);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /employer:
 *   post:
 *     summary: Create employer profile (Employer only)
 *     tags: [Employers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               companyName:
 *                 type: string
 *                 description: Company name
 *               companyProfile:
 *                 type: string
 *                 description: Company profile/description
 *     responses:
 *       201:
 *         description: Employer profile created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 employer:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Employer access required
 *       409:
 *         description: Profile already exists
 *       500:
 *         description: Server error
 */
router.post('/', protect, authorize('employer'), async (req,res) => {
  try {
    const existing = await employer.findOne({ userId: req.user._id });
    if (existing) return res.status(409).json({ error: 'Employer profile already exists' });

    const us = new employer({ ...req.body, userId: req.user._id });
    await us.save();
    return res.status(201).json({ message: 'Successful', employer: us });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

router.get('/', protect, authorize('admin'), async (req,res) => {
  try {
    const all = await employer.find({}).populate('userId', 'name email');
    return res.status(200).json(all);
  } catch(err) {
    return res.status(500).json({ error: err.message});
  }
});

router.put('/:id/verify', protect, authorize('admin'), async (req, res) => {
  try {
    const profile = await employer.findById(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Employer profile not found' });
    profile.verificationStatus = Boolean(req.body.verificationStatus);
    await profile.save();
    return res.status(200).json({ message: 'Verification updated', employer: profile });
  } catch(err) {
    return res.status(500).json({ error: err.message});
  }
});

router.get('/me', protect, authorize('employer'), async (req, res) => {
  const record = await employer.findOne({ userId: req.user._id });
  return res.status(200).json(record);
});

router.post('/', protect, authorize('employer'), async (req,res) => {

  try {

    const existing = await employer.findOne({ userId: req.user._id });
    if (existing) return res.status(409).json({ error: 'Employer profile already exists' });

    const us = new employer({ ...req.body, userId: req.user._id });
    await us.save();
    return res.status(201).json({ message: 'Successful', employer: us });

  } catch(err) {

    return res.status(500).json({ error: err.message });

  }

});

module.exports = router;