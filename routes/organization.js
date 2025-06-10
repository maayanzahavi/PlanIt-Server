const organizationController = require('../controllers/organization');
const userController = require('../controllers/user');
const projectController = require('../controllers/project');
const taskController = require('../controllers/task');
const tokenModel = require('../models/token');
const taskCommentController = require('../controllers/taskComment');
const notificationController = require('../controllers/notification');

const express = require('express');
const router = express.Router();

// Organizations
router.route('/')
  .post(organizationController.createOrganization);

router.route("/:domain")
  .get(tokenModel.isLoggedIn, organizationController.getOrganizationByDomain)
  .put(tokenModel.isLoggedIn, organizationController.updateOrganization)
  .delete(tokenModel.isLoggedIn, organizationController.deleteOrganization);

router.route("/users/:username")
.get(tokenModel.isLoggedIn, organizationController.getOrganizationByUsername);

// Users
router.route("/:domain/users")
  .get(tokenModel.isLoggedIn, organizationController.getAllUsersInOrganization)
  .post(tokenModel.isLoggedIn, userController.createTeamManager)


router.route("/:domain/users/:username")
.get(tokenModel.isLoggedIn, userController.getUserByUsername)
.put(tokenModel.isLoggedIn, userController.updateUser)
.delete(tokenModel.isLoggedIn, userController.deleteUser);

router.route("/:domain/users/:username/team")
  .post(tokenModel.isLoggedIn, userController.createTeamMember)
  .get(tokenModel.isLoggedIn, userController.getTeamMembers)

// Projects
router.route("/:domain/users/:username/projects")
  .post(tokenModel.isLoggedIn, projectController.createProject);

router.route("/:domain/users/:username/projects/:projectId")
  .get(tokenModel.isLoggedIn, projectController.getProjectById)
  .put(tokenModel.isLoggedIn, projectController.updateProject)
  .delete(tokenModel.isLoggedIn, projectController.deleteProject);
  
// Tasks
router.route("/:domain/users/:username/tasks")
  .post(tokenModel.isLoggedIn, taskController.createTask);

router.route("/:domain/users/:username/projects/:projectId/tasks")
  .get(tokenModel.isLoggedIn, taskController.getProjectTasks)

router.route("/:domain/users/:username/tasks/:taskId")
  .get(tokenModel.isLoggedIn, taskController.getTaskById)
  .put(tokenModel.isLoggedIn, taskController.updateTask)
  .delete(tokenModel.isLoggedIn, taskController.deleteTask);

router.route("/:domain/users/:username/tasks/:taskId/status")
  .put(tokenModel.isLoggedIn, taskController.changeTaskStatus);

router.route("/:domain/users/:username/tasks/:taskId/assign")
  .put(tokenModel.isLoggedIn, taskController.assignTaskToUser);

// Task Comments
router.route("/:domain/users/:username/tasks/:taskId/comments")
  .post(tokenModel.isLoggedIn, taskCommentController.createTaskComment);

router.route("/:domain/users/:username/tasks/:taskId/comments/:commentId")
  .delete(tokenModel.isLoggedIn, taskCommentController.deleteTaskComment);

// Notifications
router.route("/:domain/users/:username/projects/:projectId/tasks/notifications")
  .post(tokenModel.isLoggedIn, notificationController.sendAssignmentsNotification);

router.route("/:domain/users/:username/notifications/:notificationId")
  .delete(tokenModel.isLoggedIn, notificationController.deleteNotification);

module.exports = router;
