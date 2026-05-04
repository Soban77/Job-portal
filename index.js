const express = require('express');
const path = require('path');
const connect = require('./connecting.js');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger.js');
require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true
  }
}));

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic security headers
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('Referrer-Policy', 'no-referrer');
  next();
});

connect().catch(err => {
  console.error('MongoDB connection failed:', err.message);
});
const { connectCache } = require('./cache');
connectCache().catch(err => {
  console.error('Cache initialization failed:', err.message);
});

const user = require('./routes/User.js');
const job = require('./routes/Job.js');
const employer = require('./routes/Employer.js');
const application = require('./routes/Application.js');
const message = require('./routes/Message.js');
const api = require('./routes/register_login.js');
const upload = require('./routes/Upload.js');

app.use('/user',user);
app.use('/job',job);
app.use('/employer',employer);
app.use('/application',application);
app.use('/message',message);
app.use('/api',api);
app.use('/upload',upload);

// Serve the static HTML frontend (optional)
const frontendDir = path.join(__dirname, 'Frontend');
app.use('/', express.static(frontendDir));

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

// Only start server if this file is run directly AND not in test environment
if (require.main === module && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export app for testing
module.exports = app;