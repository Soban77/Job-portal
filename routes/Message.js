const express = require('express');
const router = express.Router();
const mesage = require('../models/job.js');

router.get('/', async (req,res) => {

  try {

    const all = await mesage.find({});

    return res.status(200).json(all);

  } catch(err) {

    return res.status(500).json({ error: err.message});

  }

});

router.post('/', async (req,res) => {

  try {

    const us = new mesage(req.body);
    await us.save();
    return res.status(201).json({ message: 'Successful' });

  } catch(err) {

    return res.status(500).json({ error: err.message });

  }

});

module.exports = router;