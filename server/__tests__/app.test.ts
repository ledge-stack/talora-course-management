const request = require('supertest');
import app from '../src/app';

describe('Server root', () => {
  it('returns running message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/University Course Management API is running/);
  });
});
