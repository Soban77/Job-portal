const express = require('express');
const connect = require('./connecting.js');
require('dotenv').config();

const app = express();

app.use(express.json());

connect();

const user = require('./routes/User.js');
const job = require('./routes/Job.js');
const employer = require('./routes/Employer.js');
const application = require('./routes/Application.js');
const message = require('./routes/Message.js');

app.use('/user',user);
app.use('/job',job);
app.use('/employer',employer);
app.use('/application',application);
app.use('/message',message);


app.listen(5000, () => {

  console.log('Server running on port');

});