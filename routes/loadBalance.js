const express = require("express");
const router = express.Router();
const loadBalanceController = require("../controllers/loadBalance");
const tokenModel = require("../models/token"); // Assuming a token model exists

router.route("/:projectId")
  .put(tokenModel.isLoggedIn, loadBalanceController.runLoadBalancer);

module.exports = router;
