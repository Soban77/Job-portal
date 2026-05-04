const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { protect } = require('../middlewares/authMiddleware');
const path = require('path');
const fs = require('fs');

/**
 * @swagger
 * /upload/resume:
 *   post:
 *     summary: Upload resume file
 *     description: Upload a resume file (PDF or DOCX) for the authenticated user
 *     tags:
 *       - Upload
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Resume uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 resumeURL:
 *                   type: string
 *       400:
 *         description: Invalid file or no file provided
 *       401:
 *         description: Unauthorized
 */
router.post('/resume', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const resumeURL = `/uploads/${req.file.filename}`;
    
    // Update user's resume URL in database if needed
    req.user.resumeURL = resumeURL;
    await req.user.save();

    return res.status(200).json({
      message: 'Resume uploaded successfully',
      resumeURL: resumeURL,
      fileName: req.file.filename
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /upload/download/{filename}:
 *   get:
 *     summary: Download resume file
 *     description: Download a resume file by filename
 *     tags:
 *       - Upload
 *     parameters:
 *       - name: filename
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File downloaded
 *       404:
 *         description: File not found
 */
router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, '../uploads', filename);

    // Security check: prevent directory traversal
    if (!filepath.startsWith(path.join(__dirname, '../uploads'))) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filepath);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;