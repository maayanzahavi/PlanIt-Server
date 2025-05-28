const express = require("express");
const router = express.Router();
const { runLoadBalancer } = require("../controllers/loadBalance");

router.route("/")
  .post(runLoadBalancer);

module.exports = router;
