const skillController = require('../controllers/skill');

const express = require('express');
const router = express.Router();

router.route('/')
  .get(skillController.getAllSkills)
  .post(skillController.createSkill);

module.exports = router