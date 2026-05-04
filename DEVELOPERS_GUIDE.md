# Developer's Guide - Job Portal

## Table of Contents
1. [Project Architecture](#project-architecture)
2. [Getting Started](#getting-started)
3. [Code Organization](#code-organization)
4. [Key Technologies](#key-technologies)
5. [Development Workflow](#development-workflow)
6. [Common Tasks](#common-tasks)
7. [Adding New Features](#adding-new-features)
8. [Best Practices](#best-practices)
9. [Debugging Tips](#debugging-tips)
10. [Contributing Guidelines](#contributing-guidelines)

---

## Project Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────────────┐
│         Frontend Layer (HTML/CSS/JS)        │
│  - 15+ pages                                │
│  - Bootstrap 5 responsive design            │
│  - Form validation and user feedback        │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────▼──────────┐
        │   API Gateway       │
        │  (Express.js)       │
        │  Port: 5000         │
        └──────────┬──────────┘
                   │
┌──────────────────▼──────────────────────────┐
│      Business Logic Layer (Routes)          │
│  - Authentication                           │
│  - Job management                           │
│  - Application workflow                     │
│  - Messaging system                         │
│  - File uploads                             │
│  - Email notifications                      │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│    Data Access Layer (Models/Services)      │
│  - User model                               │
│  - Job model                                │
│  - Application model                        │
│  - Message model                            │
│  - Email service                            │
└──────────────────┬──────────────────────────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
┌───▼────────────┐      ┌────────▼──────┐
│   MongoDB      │      │  Redis Cache  │
│   (Persistent) │      │  (Performance)│
└────────────────┘      └───────────────┘
```

### Request/Response Flow

```
User Request
    ↓
Frontend Form/API Call
    ↓
Express Server (index.js)
    ↓
Route Handler (routes/*.js)
    ↓
Middleware (auth, validation)
    ↓
Business Logic
    ↓
Model Query (Mongoose)
    ↓
MongoDB/Redis
    ↓
Response Processing
    ↓
Frontend Display
```

---

## Getting Started

### 1. Clone Repository

```bash
git clone <repository-url>
cd job-portal
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Access Application

- Frontend: `http://localhost:5000`
- API Docs: `http://localhost:5000/api-docs`

---

## Code Organization

### Directory Structure

```
job-portal/
│
├── Frontend/                    # Client-side code
│   ├── index.html              # Home page
│   ├── register.html           # Registration
│   ├── login.html              # Login
│   ├── profile.html            # User profile
│   ├── messages.html           # Messaging
│   ├── post_job.html           # Post job
│   ├── analytics.html          # Analytics
│   ├── Scripts/
│   │   ├── login.js           # Login logic
│   │   ├── register.js        # Registration logic
│   │   ├── admin_dashboard.js
│   │   └── employer_dashboard.js
│   └── Job_Seeker/
│       ├── seeker_dashboard.html
│       ├── search_jobs.html
│       ├── resume_builder.html
│       ├── job_details.html
│       ├── application_details.html
│       └── scripts/
│           └── seeker_dashboard.js
│
├── config/                      # Configuration
│   └── swagger.js              # Swagger/OpenAPI config
│
├── middlewares/                 # Middleware functions
│   ├── authMiddleware.js       # JWT authentication
│   └── upload.js               # File upload (Multer)
│
├── models/                      # Mongoose schemas
│   ├── user.js
│   ├── job.js
│   ├── application.js
│   ├── message.js
│   └── employer.js
│
├── routes/                      # API endpoints
│   ├── register_login.js
│   ├── User.js
│   ├── Job.js
│   ├── Application.js
│   ├── Message.js
│   ├── Employer.js
│   └── Upload.js
│
├── services/                    # Business logic services
│   └── emailService.js         # Email notifications
│
├── tests/                       # Test suite
│   └── api.test.js
│
├── uploads/                     # Uploaded files directory
│
├── index.js                     # Main server file
├── connecting.js                # Database connection
├── cache.js                     # Cache setup
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

### File Naming Conventions

- **Routes:** PascalCase (`User.js`, `Job.js`)
- **Models:** lowercase (`user.js`, `job.js`)
- **Services:** camelCase with Service suffix (`emailService.js`)
- **Middleware:** camelCase (`authMiddleware.js`)
- **HTML files:** snake_case (`search_jobs.html`)
- **JavaScript files:** camelCase (`seeker_dashboard.js`)

---

## Key Technologies

### Express.js Basics

```javascript
// Basic route structure
app.get('/endpoint', middlewares, async (req, res) => {
  try {
    const data = await Model.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Mongoose Schema

```javascript
// Define schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['seeker', 'employer', 'admin'] },
  createdAt: { type: Date, default: Date.now }
});

// Create model
module.exports = mongoose.model('User', userSchema);
```

### JWT Authentication

```javascript
// Verify token
const token = req.headers.authorization.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded;

// Generate token
const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
  expiresIn: '24h'
});
```

### Redis Caching

```javascript
// Set cache
redis.setex(`jobs:${key}`, 60, JSON.stringify(data));

// Get cache
const cached = await redis.get(`jobs:${key}`);
if (cached) return JSON.parse(cached);

// Delete cache (invalidation)
redis.del(`jobs:${key}`);
```

### Multer File Upload

```javascript
const upload = multer({
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
  }),
  fileFilter: (req, file, cb) => {
    const validMimes = ['application/pdf', 'application/vnd.ms-word'];
    cb(validMimes.includes(file.mimetype) ? null : 'Invalid file', 
       validMimes.includes(file.mimetype));
  }
});
```

---

## Development Workflow

### 1. Creating a New Route

#### Step 1: Create Route File

Create `routes/NewFeature.js`:

```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');

// GET
router.get('/', protect, async (req, res) => {
  try {
    // Logic here
    res.json({ message: 'Success' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST
router.post('/', protect, async (req, res) => {
  try {
    // Logic here
    res.status(201).json({ message: 'Created' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
```

#### Step 2: Register Route in index.js

```javascript
const newFeatureRoutes = require('./routes/NewFeature');
app.use('/newfeature', newFeatureRoutes);
```

#### Step 3: Add Swagger Documentation

```javascript
/**
 * @swagger
 * /newfeature:
 *   get:
 *     summary: Get new feature data
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
```

### 2. Creating a New Model

Create `models/NewModel.js`:

```javascript
const mongoose = require('mongoose');

const newModelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

// Add indexes for performance
newModelSchema.index({ email: 1 });
newModelSchema.index({ createdAt: -1 });

module.exports = mongoose.model('NewModel', newModelSchema);
```

### 3. Adding Middleware

Create `middlewares/newMiddleware.js`:

```javascript
module.exports = (req, res, next) => {
  // Middleware logic
  if (/* condition */) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

// Use in routes
router.post('/', newMiddleware, async (req, res) => {
  // Route logic
});
```

### 4. Writing Tests

Add test in `tests/api.test.js`:

```javascript
describe('New Feature', () => {
  test('Should get feature data', async () => {
    const response = await request(app)
      .get('/newfeature')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message');
  });
});
```

---

## Common Tasks

### Task 1: Add New Job Field

1. **Update Model** (`models/job.js`):
```javascript
const jobSchema = new mongoose.Schema({
  // ... existing fields
  newField: { type: String, default: 'value' }
});
```

2. **Update Form** (`Frontend/post_job.html`):
```html
<input type="text" name="newField" placeholder="New Field">
```

3. **Update Route** (`routes/Job.js`):
```javascript
const job = new Job({
  title: req.body.title,
  newField: req.body.newField
});
```

4. **Update Tests**:
```javascript
test('Should create job with new field', async () => {
  const job = await Job.create({ newField: 'test' });
  expect(job.newField).toBe('test');
});
```

### Task 2: Add Email Notification

1. **Update emailService.js**:
```javascript
async function sendNotificationEmail(email, data) {
  const template = `<html>...${data.message}...</html>`;
  await sendEmail(email, 'Subject', template);
}
```

2. **Call in Route**:
```javascript
await sendNotificationEmail(user.email, emailData);
```

### Task 3: Add Caching

1. **In Route**:
```javascript
// Try cache first
const cached = await redis.get(`key:${id}`);
if (cached) return res.json(JSON.parse(cached));

// Fetch from DB
const data = await Model.findById(id);

// Cache for 60 seconds
redis.setex(`key:${id}`, 60, JSON.stringify(data));

res.json(data);
```

2. **Cache Invalidation**:
```javascript
// On update
redis.del(`key:${id}`);
```

### Task 4: Add Authentication Check

```javascript
const { protect, authorize } = require('../middlewares/authMiddleware');

// Protected route (any authenticated user)
router.get('/me', protect, (req, res) => {
  res.json(req.user);
});

// Authorization check (specific role)
router.post('/', protect, authorize('employer'), (req, res) => {
  // Only employers can access
});
```

---

## Adding New Features

### Example: Add Review System

#### Step 1: Create Model
```javascript
// models/review.js
const reviewSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seekerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now }
});
```

#### Step 2: Create Routes
```javascript
// routes/Review.js
router.post('/', protect, async (req, res) => {
  const review = new Review(req.body);
  await review.save();
  res.status(201).json(review);
});

router.get('/job/:jobId', async (req, res) => {
  const reviews = await Review.find({ jobId: req.params.jobId });
  res.json(reviews);
});
```

#### Step 3: Create Frontend
```html
<!-- Frontend/review.html -->
<form id="reviewForm">
  <select id="rating" required>
    <option value="">Select Rating</option>
    <option value="1">1 Star</option>
    <option value="5">5 Stars</option>
  </select>
  <textarea id="comment"></textarea>
  <button type="submit">Submit Review</button>
</form>
```

#### Step 4: Add Tests
```javascript
test('Should create review', async () => {
  const review = await request(app)
    .post('/review')
    .set('Authorization', `Bearer ${token}`)
    .send({ jobId, rating: 5, comment: 'Great!' });
  
  expect(review.status).toBe(201);
  expect(review.body.rating).toBe(5);
});
```

---

## Best Practices

### 1. Error Handling

```javascript
try {
  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
}
```

### 2. Input Validation

```javascript
// Validate email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({ error: 'Invalid email' });
}

// Validate required fields
if (!name || !email || !password) {
  return res.status(400).json({ error: 'Missing required fields' });
}
```

### 3. Security

```javascript
// Hash passwords
const hashedPassword = await bcryptjs.hash(password, 10);
user.password = hashedPassword;

// Validate JWT
const token = jwt.verify(token, process.env.JWT_SECRET);

// Escape user input
const cleanInput = DOMPurify.sanitize(userInput);
```

### 4. Performance

```javascript
// Use indexes
userSchema.index({ email: 1 });
jobSchema.index({ employerId: 1, createdAt: -1 });

// Limit queries
const limit = Math.min(req.query.limit || 20, 100);
const jobs = await Job.find().limit(limit).skip(offset);

// Use projection
const user = await User.findById(id).select('name email role');
```

### 5. Code Style

```javascript
// Use async/await (not callbacks)
const user = await User.findById(id);

// Use descriptive names
const getUserByEmail = async (email) => { };

// Add comments for complex logic
// This calculates the average rating for the job
const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

// Use const/let (not var)
const MAX_FILE_SIZE = 5242880;
let userCount = 0;
```

---

## Debugging Tips

### 1. Console Logging

```javascript
// Log values
console.log('User:', user);
console.log('Error:', error.message);

// Structured logging
console.log(JSON.stringify({ user: user, timestamp: new Date() }, null, 2));
```

### 2. Debugging in VS Code

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/index.js"
    }
  ]
}
```

### 3. Debug Database Queries

```javascript
// Enable Mongoose debugging
mongoose.set('debug', true);

// Or log individual queries
const result = await User.find().explain('executionStats');
console.log(result);
```

### 4. Debug Redis

```bash
# Connect to Redis CLI
redis-cli

# Check keys
keys *

# Check specific key
get mykey

# Monitor commands
monitor
```

### 5. Network Debugging

```javascript
// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Log response time
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});
```

---

## Contributing Guidelines

### 1. Fork and Clone

```bash
git clone your-fork-url
cd job-portal
```

### 2. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes

```bash
# Make your changes
# Test thoroughly
npm test
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: Add feature description"
# Use conventional commit format:
# feat: New feature
# fix: Bug fix
# docs: Documentation
# refactor: Code refactoring
```

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
# Create PR on GitHub
```

### 6. Code Review

- At least 1 approval required
- All tests must pass
- No conflicts with main branch

---

## Useful Commands

```bash
# Development
npm run dev              # Start with auto-reload
npm start               # Start production server
npm test                # Run tests
npm test -- --coverage  # Test coverage

# Database
mongosh "mongodb://localhost:27017/job_portal"

# Redis
redis-cli
redis-cli KEYS "*"

# Git
git log --oneline
git diff
git status

# NPM
npm install package-name
npm update
npm audit fix
```

---

## Resources

- [Express.js Documentation](https://expressjs.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [MongoDB Manual](https://docs.mongodb.com/manual)
- [Redis Documentation](https://redis.io/documentation)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [MDN Web Docs](https://developer.mozilla.org)

---

## Support

For questions or issues:
1. Check existing issues on GitHub
2. Review project documentation
3. Consult team members
4. Create detailed issue report

---

**Developer's Guide Version:** 1.0  
**Last Updated:** May 2, 2026  
**Maintainer:** Project Team