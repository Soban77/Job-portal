const request = require('supertest');
const app = require('../index.js');

describe('Basic App Test', () => {
  test('Should respond to health check', async () => {
    const res = await request(app)
      .get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});