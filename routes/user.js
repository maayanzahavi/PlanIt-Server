const userController = require("../controllers/user");
const tokenModel = require('../models/token');


const express = require('express');
const router = express.Router();


router.route('/')
  .post(userController.createUser);

router.route("/:id")
  .get(tokenModel.isLoggedIn, userController.getUserById)
  .put(tokenModel.isLoggedIn, userController.updateUser)
  .delete(tokenModel.isLoggedIn, userController.deleteUser);

  router.get('/public/:id', userController.getUserById); 

// Check user availability
router.route("/check-availability")
  .post(userController.checkAvailability);


  module.exports = router;
