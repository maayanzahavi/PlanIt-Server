/**
 * Integration test for creating a new programming project.
 *
 * This test performs the following steps:
 * 1. Starts the backend server before executing the test.
 * 2. Sends a POST request to create a new project for a given manager.
 * 3. Verifies that the response returns status 201 and includes the correct project title.
 *
 * This test covers User Story 1: "As a manager, I want to create a new project."
 */


const request = require('supertest');
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

let serverProcess;

// Generate a JWT token for testing
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  {
    _id: '680e1e6462b65a41d18d9025', 
    username: 'manager1'
  },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

// Start the server before running tests
beforeAll((done) => {
  serverProcess = spawn('node', [path.join(__dirname, '../server.js')], {
    stdio: 'inherit',
  });

 // Wait for the server to start
  setTimeout(done, 4000);
});

// Stop the server after tests are done
afterAll(() => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

// Test for creating a programming project
describe('Project API', () => {
  test('User Story 1: should create a programming project', async () => {
    const projectData = {
      title: 'Build E-commerce Website',
      description: 'Some description',
      tasks: [],     
      team: []
    };

    const domain = 'tech-nova';
    const username = 'manager1';

    const response = await request('http://localhost:8800')
            .post(`/api/organizations/${domain}/users/${username}/projects`)
            .set('Authorization', `Bearer ${token}`)
            .send(projectData);
    
    // Check if the response is successful
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe('Build E-commerce Website');
  });
});
