// User Story: Update Team Member Profile
// This test verifies that a manager can update a team member's profile.
// It sends a PUT request to update the team member's first name and checks that the response
// status is 200 and the updated name is correctly reflected in the response body.

const request = require('supertest');
const { spawn } = require('child_process');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();


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

// User Story: Update Team Member Profile
test('should update a team member profile successfully', async () => {
  const domain = 'tech-nova';
  const username = 'member2test';

  const res = await request('http://localhost:8800')
    .put(`/api/organizations/${domain}/users/${username}`)
    .set('Authorization', `Bearer ${token}`)
    .send({ firstName: 'Dan' });

  expect(res.status).toBe(200);
  expect(res.body.firstName).toBe('Dan');
});

