const organizationController = require('../controllers/organization');
const userController = require('../controllers/user');

// Organization Routes
router.route('/')
  .post(organizationController.createOrganization);

router.route("/:id")
  .get(organizationController.getOrganizationById)
  .put(tokenModel.isLoggedIn ,organizationController.updateOrganization)
  .delete(tokenModel.isLoggedIn, organizationController.deleteOrganization);

// Organization Users
router.route("/:id/managers")
  .post(userController.createTeamManager);

router.route("/:id/managers/:managerId")
  .get(userController.getUserById)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

// Organization Manager Projects
router.route("/:id/managers/:managerId/projects")
  .get(userController.getUserProjects)

// Organization Manager Team
router.route("/:id/managers/:managerId/team")
  .post(userController.createTeamMember);

router.route("/:id/managers/:managerId/team/:teamMemberId")
  .get(userController.getUserById)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

// Team Manager Projects
router.route("/:id/managers/:managerId/team/:teamMemberId/projects")
  .get(userController.getUserProjects);

router.route("/:id/managers/:managerId/team/:teamMemberId/projects/:projectId")
  .get(userController.getProjectById)

// Team Member Tasks
router.route("/:id/managers/:managerId/team/:teamMemberId/projects/:projectId/tasks")
  .get(userController.getProjectTasks)

router.route("/:id/managers/:managerId/team/:teamMemberId/projects/:projectId/tasks/:taskId")
  .get(userController.getTaskById)
  .put(userController.updateTask)