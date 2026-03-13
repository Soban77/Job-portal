const express = require('express');
const router = express.Router();
const user = require('../models/user.js');

router.get('/', async (req,res) => {

  try {

    const all = await user.find({});

  }

})