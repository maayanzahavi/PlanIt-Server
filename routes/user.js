const userController = require("../controllers/user");

const express = require('express');
const router = express.Router();


router.route('/')
  .post(userController.createUser);

router.route("/:id")
  .get(userController.getUserById)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

router.route("/:id/projects")
  .get(userController.getUserVideos)
  .post(videoController.createVideo);
