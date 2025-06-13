const request = require('supertest');
const { spawn } = require('child_process');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

let serverProcess;

// Generate a JWT token for authentication
const token = jwt.sign(
  {
    _id: '680e1e6462b65a41d18d9025',
    username: 'manager1',
    role: 'manager'
  },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

const domain = 'tech-nova';
const managerUsername = 'manager1';
const projectId = '684c226eacba883712d1cdf9';

let memberMap = {};
let taskMap = {};

// Launch the server before running tests
beforeAll((done) => {
  serverProcess = spawn('node', [path.join(__dirname, '../server.js')], {
    stdio: 'inherit',
  });
  setTimeout(done, 4000);
});

afterAll(() => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

// Integration test for full load balancer functionality
describe('Full Load Balancer Integration Test', () => {
  test('should create 2 team members', async () => {
    const members = [
      {
        email: 'member1@test.com',
        username: 'member1test',
        firstName: 'Alice',
        lastName: 'Dev',
        password: 'As1234',
        skills: ['Python'],
        preferences: ['Artificial Intelligence'],
        experience: 3
      },
      {
        email: 'member2@test.com',
        username: 'member2test',
        firstName: 'Bob',
        lastName: 'Ops',
        password: 'As1234',
        skills: ['Artificial Intelligence'],
        preferences: ['Python'],
        experience: 2
      }
    ];

    for (const member of members) {
      const res = await request('http://localhost:8800')
        .post(`/api/organizations/${domain}/users/${managerUsername}/team`)
        .set('Authorization', `Bearer ${token}`)
        .send(member);

      expect(res.statusCode).toBe(201);
      expect(res.body._id).toBeDefined();
      memberMap[member.username] = res.body._id;
    }
  });

  test('should create 3 tasks in the project', async () => {
    const tasks = [
      {
        title: 'Implement AI module',
        description: 'AI module for decision making',
        tags: ['68177f0ae010f653b19f8833'],
        priority: 'High',
        project: projectId
      },
      {
        title: 'Build Python backend',
        description: 'REST API with Python',
        tags: ['68177f0ae010f653b19f8842'],
        priority: 'Medium',
        project: projectId
      },
      {
        title: 'Optimize algorithm',
        description: 'Improve runtime of core logic',
        tags: ['68177f0ae010f653b19f883d'],
        priority: 'Low',
        project: projectId
      }
    ];

    for (const task of tasks) {
      const res = await request('http://localhost:8800')
        .post(`/api/organizations/${domain}/users/${managerUsername}/tasks`)
        .set('Authorization', `Bearer ${token}`)
        .send(task);

      expect(res.statusCode).toBe(201);
      expect(res.body._id).toBeDefined();
      taskMap[task.title] = res.body._id;
    }
  });

  test('should run load balancing and return expected assignments', async () => {
    const res = await request('http://localhost:8800')
      .put(`/api/loadBalance/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json')
      .send({
        _id: projectId,
        title: 'AI Optimization Project',
        preferencesWeight: 0.5,
        availabilities: {
          [memberMap['member1test']]: 3,
          [memberMap['member2test']]: 3
        },
        tasks: [
          {
            _id: taskMap['Implement AI module'],
            tags: [{ _id: '68177f0ae010f653b19f8833' }],
            type: 'AI',
            weight: 3,
            urgency: 3
          },
          {
            _id: taskMap['Build Python backend'],
            tags: [{ _id: '68177f0ae010f653b19f8842' }],
            type: 'Dev',
            weight: 2,
            urgency: 2
          },
          {
            _id: taskMap['Optimize algorithm'],
            tags: [{ _id: '68177f0ae010f653b19f883d' }],
            type: 'Optimization',
            weight: 1,
            urgency: 1
          }
        ],
        team: [
          {
            _id: memberMap['member1test'],
            skills: ['Python'],
            preferences: ['Artificial Intelligence'],
            experience: 3
          },
          {
            _id: memberMap['member2test'],
            skills: ['Artificial Intelligence'],
            preferences: ['Python'],
            experience: 2
          }
        ]
      });

      // Check the response
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();
    expect(res.body.tasks).toBeDefined();

    const assignments = res.body.tasks;

    const task1Id = String(taskMap['Implement AI module']);
    const task2Id = String(taskMap['Build Python backend']);
    const task3Id = String(taskMap['Optimize algorithm']);

    const memberA = String(memberMap['member1test']);
    const memberB = String(memberMap['member2test']);

    // Check each assignment
const findAssignedTo = (taskId) => {
  const task = assignments.find(t => t._id === taskId);
  if (!task) throw new Error(`Task with ID ${taskId} not found`);
  if (!task.assignedTo) throw new Error(`Task '${task.title}' is missing assignedTo`);
  return task.assignedTo._id;
};

// Verify that tasks are assigned to the correct members
expect([memberA, memberB]).toContain(findAssignedTo(task1Id));
expect([memberA, memberB]).toContain(findAssignedTo(task2Id));
expect([memberA, memberB]).toContain(findAssignedTo(task3Id));


  });
});
