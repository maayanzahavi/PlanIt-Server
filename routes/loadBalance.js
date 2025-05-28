const express = require("express");
const router = express.Router();
const { runLoadBalancer } = require("../controllers/loadBalance");

router.route("/")
  .get(runLoadBalancer);
  
module.exports = router;
