const userController = require("../controllers/userController");

router.route('/')
  .post(userController.createUser);

router.route("/:id")
  .get(userController.getUserById)
  .put(tokenModel.isLoggedIn ,userController.updateUser)
  .delete(tokenModel.isLoggedIn, userController.deleteUser);

router.route("/:id/projects")
  .get(userController.getUserVideos)
  .post(tokenModel.isLoggedIn, videoController.createVideo);
