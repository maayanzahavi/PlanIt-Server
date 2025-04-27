const organizationController = require('../controllers/organization');
const userController = require('../controllers/user');
const projectController = require('../controllers/project');
const taskController = require('../controllers/task');

const express = require('express');
const router = express.Router();


// Organization Routes
router.route('/')
  .post(organizationController.createOrganization);

router.route("/:domain")
  .get(organizationController.getOrganizationById)
  .put(organizationController.updateOrganization)
  .delete(organizationController.deleteOrganization);

// Organization Users
router.route("/:domain/managers")
  .post(userController.createTeamManager);

router.route("/:domain/managers/:managerUsername")
  .get(userController.getUserByUsername)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

// Organization Manager Projects
// router.route("/:domain/managers/:managerUsername/projects")
//   .get(userController.getUserProjects)

// Organization Manager Team
router.route("/:domain/managers/:managerUsername/team")
  .post(userController.createTeamMember);

router.route("/:domain/managers/:managerUsername/team/:teamMemberUsername")
  .get(userController.getUserById)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

// Team Manager Projects
router.route("/:domain/managers/:managerUsername/team/:teamMemberUsername/projects")
  // .get(userController.getUserProjects);

router.route("/:domain/managers/:managerUsername/team/:teamMemberUsername/projects/:projectId")
  .get(projectController.getProjectById)

// Team Member Tasks
router.route("/:domain/managers/:managerUsername/team/:teamMemberUsername/projects/:projectId/tasks")
  .get(taskController.getProjectTasks)

router.route("/:domain/managers/:managerUsername/team/:teamMemberUsername/projects/:projectId/tasks/:taskId")
  .get(taskController.getTaskById)
  .put(taskController.updateTask)


module.exports = router;
