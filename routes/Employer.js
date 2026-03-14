const express = require('express');
const router = express.Router();
const employer = require('../models/employer.js');

router.get('/', async (req,res) => {

  try {

    const all = await employer.find({});

    return res.status(200).json(all);

  } catch(err) {

    return res.status(500).json({ error: err.message});

  }

});

router.post('/', async (req,res) => {

  try {

    const us = new employer(req.body);
    await us.save();
    return res.status(201).json({ message: 'Successful' });

  } catch(err) {

    return res.status(500).json({ error: err.message });

  }

});

module.exports = router;