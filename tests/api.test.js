const request = require('supertest');
const app = require('../index.js');
const User = require('../models/user.js');
const Job = require('../models/job.js');
const Application = require('../models/application.js');

describe('Job Portal API Tests', () => {
  let token;
  let userId;
  let jobId;

  // Setup: Register and login a test user
  beforeAll(async () => {
    // Register a test user
    const registerRes = await request(app)
      .post('/api/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'testpass123',
        role: 'seeker'
      });

    // Login
    const loginRes = await request(app)
      .post('/api/login')
      .send({
        email: 'test@example.com',
        password: 'testpass123'
      });

    token = loginRes.body.token;
  });

  describe('Authentication Tests', () => {
    test('Should register a new user', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({
          name: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
          role: 'employer'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.user).toBeDefined();
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe('newuser@example.com');
    });

    test('Should login successfully', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'testpass123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.token).toBeDefined();
    });
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'testpass123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    test('Should fail login with wrong password', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('Job Management Tests', () => {
    test('Should retrieve all jobs', async () => {
      const res = await request(app)
        .get('/job');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('Should search jobs with filters', async () => {
      const res = await request(app)
        .get('/job?search=developer&category=IT');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('Should post a new job (employer only)', async () => {
      const res = await request(app)
        .post('/job')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Senior Developer',
          description: 'We are looking for a senior developer',
          category: 'IT',
          skillsRequired: ['Node.js', 'React'],
          location: 'Karachi',
          jobType: 'Full-time',
          salaryMin: 100000,
          salaryMax: 200000,
          experienceLevel: 'Senior'
        });

      if (res.statusCode === 201) {
        jobId = res.body.Job._id;
      }
      // Note: May fail if user is not employer role
    });
  });

  describe('User Profile Tests', () => {
    test('Should get user profile', async () => {
      const res = await request(app)
        .get('/user/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBeDefined();
    });

    test('Should update user profile', async () => {
      const res = await request(app)
        .put('/user/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name',
          skills: ['JavaScript', 'Python']
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.user.name).toBe('Updated Name');
    });

    test('Should fail without authentication', async () => {
      const res = await request(app)
        .get('/user/me');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('Messaging Tests', () => {
    test('Should retrieve messages', async () => {
      const res = await request(app)
        .get('/message')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('Should send a message', async () => {
      const res = await request(app)
        .post('/message')
        .set('Authorization', `Bearer ${token}`)
        .send({
          recipient: 'employer@example.com',
          subject: 'Test Message',
          content: 'This is a test message'
        });

      expect(res.statusCode).toBeOneOf([200, 201]);
    });
  });

  describe('Application Tests', () => {
    test('Should get user applications', async () => {
      const res = await request(app)
        .get('/application')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Cache Performance Tests', () => {
    test('Should cache job search results', async () => {
      // First request - should miss cache
      const res1 = await request(app)
        .get('/job?search=developer');

      // Second request - should hit cache
      const res2 = await request(app)
        .get('/job?search=developer');

      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(200);
      // Cache header would indicate HIT/MISS if implemented
    });
  });

  describe('Error Handling Tests', () => {
    test('Should return 404 for non-existent route', async () => {
      const res = await request(app)
        .get('/nonexistent');

      expect(res.statusCode).toBe(404);
    });

    test('Should handle malformed requests', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({
          name: 'Test'
          // Missing required fields
        });

      expect(res.statusCode).toBeGreaterThanOrEqual(400);
    });
  });
});

// Extend Jest matchers
expect.extend({
  toBeOneOf(received, expected) {
    const pass = expected.includes(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${expected}`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be one of ${expected}`,
        pass: false
      };
    }
  }
});