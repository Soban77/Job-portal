const User = require('../models/user.js');
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * /auth/health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Service health status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 hasJwtSecret:
 *                   type: boolean
 */
router.get('/health', (req, res) => {
  res.json({ ok: true, hasJwtSecret: Boolean(process.env.JWT_SECRET) });
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
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
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password
 *               role:
 *                 type: string
 *                 enum: [seeker, employer, admin]
 *                 description: User's role in the system
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       400:
 *         description: Bad request - validation error
 *       500:
 *         description: Server error
 */
router.post('/register', async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET is not set in environment' });
    }
    const user = new User(req.body);
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     role:
 *                       type: string
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET is not set in environment' });
    }
    const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

router.get('/health', (req, res) => {
  res.json({ ok: true, hasJwtSecret: Boolean(process.env.JWT_SECRET) });
});

router.post('/register', async (req, res) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET is not set in environment' });
    }
    const user = new User(req.body);
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.status(201).json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'JWT_SECRET is not set in environment' });
    }
    const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;