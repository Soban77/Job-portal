const express = require('express');
const router = express.Router();
const user = require('../models/user.js');

router.get('/', async (req,res) => {

  try {

    const all = await user.find({});

    return res.status(200).json(all);

  } catch(err) {

    return res.status(500).json({ error: err.message});

  }

});

module.exports = router;