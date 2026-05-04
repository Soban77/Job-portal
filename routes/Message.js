const express = require('express');
const router = express.Router();
const Message = require('../models/message.js');
const { protect } = require('../middlewares/authMiddleware.js');

/**
 * @swagger
 * /message:
 *   get:
 *     summary: Get user's messages (sent and received)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   senderId:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                   receiverId:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                   subject:
 *                     type: string
 *                   content:
 *                     type: string
 *                   isRead:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', protect, async (req,res) => {
  try {
    const all = await Message.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }]
    })
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json(all);
  } catch(err) {
    return res.status(500).json({ error: err.message});
  }
});

/**
 * @swagger
 * /message:
 *   post:
 *     summary: Send a new message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipient
 *               - subject
 *               - content
 *             properties:
 *               recipient:
 *                 type: string
 *                 description: Email of the recipient
 *               subject:
 *                 type: string
 *                 description: Message subject
 *               content:
 *                 type: string
 *                 description: Message content
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Recipient not found
 *       500:
 *         description: Server error
 */
router.post('/', protect, async (req,res) => {
  try {
    const { recipient, subject, content } = req.body;

    // Find recipient by email
    const User = require('../models/user.js');
    const recipientUser = await User.findOne({ email: recipient });
    if (!recipientUser) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    const msg = new Message({
      senderId: req.user._id,
      receiverId: recipientUser._id,
      subject,
      content
    });
    await msg.save();

    return res.status(201).json({ message: 'Message sent successfully', data: msg });
  } catch(err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

router.get('/', protect, async (req,res) => {
  try {
    const all = await Message.find({
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }]
    })
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email');

    return res.status(200).json(all);
  } catch(err) {
    return res.status(500).json({ error: err.message});
  }
});

router.post('/', protect, async (req,res) => {

  try {

    const { receiverId, jobId, messageText } = req.body;
    const msg = new Message({
      senderId: req.user._id,
      receiverId,
      jobId,
      messageText
    });
    await msg.save();
    return res.status(201).json({ message: 'Successful', msg });

  } catch(err) {

    return res.status(500).json({ error: err.message });

  }

});

module.exports = router;