const organizationController = require('../controllers/organization');
const userController = require('../controllers/user');
const projectController = require('../controllers/project');
const taskController = require('../controllers/task');

const express = require('express');
const router = express.Router();

// Organizations
router.route('/')
  .post(organizationController.createOrganization);

router.route("/:domain")
  .get(organizationController.getOrganizationByDomain)
  .put(organizationController.updateOrganization)
  .delete(organizationController.deleteOrganization);


// Users
router.route("/:domain/users")
  .post(userController.createTeamManager);

router.route("/:domain/users/:username/team")
  .post(userController.createTeamManager);

router.route("/:domain/users/:username")
.get(userController.getUserByUsername)
.put(userController.updateUser)
.delete(userController.deleteUser);


// Projects
router.route("/:domain/projects")
  .post(projectController.createProject);

router.route("/:domain/projects/:projectId")
  .get(projectController.getProjectById)
  .put(projectController.updateProject)
  .delete(projectController.deleteProject);

  
// Tasks
router.route("/:domain/projects/:projectId/tasks")
  .get(taskController.getProjectTasks)
  .post(taskController.createTask);

router.route("/:domain/projects/:projectId/tasks/:taskId")
  .get(taskController.getTaskById)
  .put(taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;
