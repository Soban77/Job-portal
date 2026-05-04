const express = require('express');
const router = express.Router();
const user = require('../models/user.js');
const { protect, authorize } = require('../middlewares/authMiddleware.js');

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   role:
 *                     type: string
 *                     enum: [seeker, employer, admin]
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.get('/', protect, authorize('admin'), async (req,res) => {
  try {
    const all = await user.find({}, '-password');
    return res.status(200).json(all);
  } catch(err) {
    return res.status(500).json({ error: err.message});
  }
});

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 role:
 *                   type: string
 *                   enum: [seeker, employer, admin]
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: string
 *                 resumeURL:
 *                   type: string
 *                 profileInfo:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/me', protect, async (req, res) => {
  return res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    skills: req.user.skills,
    resumeURL: req.user.resumeURL,
    profileInfo: req.user.profileInfo
  });
});

/**
 * @swagger
 * /user/me:
 *   put:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               resumeURL:
 *                 type: string
 *               profileInfo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/me', protect, async (req, res) => {
  try {
    const allowed = ['name', 'skills', 'resumeURL', 'profileInfo'];
    for (const k of allowed) {
      if (k in req.body) req.user[k] = req.body[k];
    }
    await req.user.save();
    return res.status(200).json({ message: 'Updated', user: req.user });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Create new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [seeker, employer, admin]
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               resumeURL:
 *                 type: string
 *               profileInfo:
 *                 type: string
 *               company:
 *                 type: string
 *               website:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
router.post('/', protect, authorize('admin'), async (req,res) => {
  try {
    const us = new user(req.body);
    await us.save();
    return res.status(201).json({ message: 'Successful' });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *         description: Forbidden - Admin access required
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.get('/', protect, authorize('admin'), async (req,res) => {
  try {
    const all = await user.find({}, '-password');
    return res.status(200).json(all);
  } catch(err) {
    return res.status(500).json({ error: err.message});
  }
});

router.get('/me', protect, async (req, res) => {
  return res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    skills: req.user.skills,
    resumeURL: req.user.resumeURL,
    profileInfo: req.user.profileInfo
  });
});

router.put('/me', protect, async (req, res) => {
  try {
    const allowed = ['name', 'skills', 'resumeURL', 'profileInfo'];
    for (const k of allowed) {
      if (k in req.body) req.user[k] = req.body[k];
    }
    await req.user.save();
    return res.status(200).json({ message: 'Updated', user: req.user });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.post('/', protect, authorize('admin'), async (req,res) => {
  try {
    const us = new user(req.body);
    await us.save();
    return res.status(201).json({ message: 'Successful' });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const removed = await user.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;