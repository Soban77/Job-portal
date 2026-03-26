const express = require('express');
const router = express.Router();
const job = require('../models/job.js');
const { protect, authorize } = require('../middleware/authMiddleware')

router.get('/', async (req,res) => {

  try {

    const all = await job.find({});

    return res.status(200).json(all);

  } catch(err) {

    return res.status(500).json({ error: err.message});

  }

});

router.post('/', protect, authorize('employer'), async (req, res) => {
  try {

    const Job = new job({ ...req.body, employer: req.user._id });
    await Job.save();
    return res.status(201).json({ message: 'Successful', Job });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});


module.exports = router;