const request = require('supertest');
const { spawn } = require('child_process');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const domain = 'tech-nova';
const managerUsername = 'manager1';


// token for authentication
const token = jwt.sign(
  {
    _id: '680e1e6462b65a41d18d9025',
    username: 'manager1',
    role: 'manager'
  },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Launch the server before running tests
beforeAll((done) => {
  serverProcess = spawn('node', [path.join(__dirname, '../server.js')], {
    stdio: 'inherit',
  });
  setTimeout(done, 4000);
});

// Kill the server after tests
afterAll(() => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

// User Story: Update Programming Task to Completed
describe('User Story 6: Update Programming Task', () => {
  it('should update task status to completed', async () => {
    const taskId = '684c4052afa67c4f8d07fed8';

    const res = await request('http://localhost:8800')
      .put(`/api/organizations/${domain}/users/${managerUsername}/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
  });
});
