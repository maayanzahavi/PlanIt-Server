const request = require('supertest');
const { spawn } = require('child_process');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

let serverProcess;

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

describe('Load Balancer Integration Test (reusing existing data)', () => {
  const domain = 'tech-nova';
  const managerUsername = 'manager1';
  const projectId = '684c226eacba883712d1cdf9';
  let projectData;

  test('should fetch existing project with team and tasks', async () => {
    // Get project from the backend
    const res = await request('http://localhost:8800')
      .get(`/api/projects/${projectId}`) // You must ensure this route exists
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body.tasks.length).toBeGreaterThan(0);
    expect(res.body.team.length).toBeGreaterThan(0);

    projectData = res.body; // Store full project object to pass into load balancer
  });

  test('should run the load balancer and assign tasks', async () => {
    const res = await request('http://localhost:8800')
      .put(`/api/loadBalance/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(projectData); // required by your controller to populate input.json

    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body.tasks).toBeDefined();
    expect(res.body.tasks.length).toBeGreaterThan(0);

    console.log('Updated project task assignments:', res.body.tasks.map(t => ({
      title: t.title,
      assignedTo: t.assignedTo
    })));
  });
});
