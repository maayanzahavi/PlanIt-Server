const express = require("express");
const router = express.Router();
const loadBalanceController = require("../controllers/loadBalance");
const tokenModel = require("../models/token"); // Assuming a token model exists

router.route("/")
  .put(tokenModel.isLoggedIn, loadBalanceController.runLoadBalancer);

module.exports = router;
