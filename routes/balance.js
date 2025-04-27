const express = require("express");
const router = express.Router();
const { runLoadBalancer } = require("../controllers/balanceController");

// router.post("/", runLoadBalancer);

module.exports = router;
