const express = require('express');
const connect = require('./connecting.js');
const {User,job,Application,Employer,Message} = require('./create.js');
require('dotenv').config();

const app = express();

app.use(express.json());

connect();

const user = require('./routes/User.js');

app.use()

app.listen(5000, () => {

  console.log('Server running on port');

});