const request = require('supertest');
const { spawn } = require('child_process');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

  const taskId = '680e1ea162b65a41d18d904f';
  const domain = 'tech-nova';
  const username = 'member2test';
  const commentContent = 'Great task, well-defined!';

// token for authentication
const token = jwt.sign(
  {
    _id: '684c4052afa67c4f8d07fecc',
    username: 'member2test',
    role: 'team_member'
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

test('should create a comment on a task successfully', async () => {

  const res = await request('http://localhost:8800')
    .post(`/api/organizations/${domain}/users/${username}/tasks/${taskId}/comments`)
    .set('Authorization', `Bearer ${token}`)
    .send({ content: commentContent });
// Check if the response status is 201 Created
  expect(res.status).toBe(201);
  expect(res.body.content).toBe(commentContent);
  expect(res.body.author).toBe(username);
});
