const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai');
const tokenModel = require('../models/token');

// Generate skills and preferences for user 
router.route('/generate-skills')
 .post(tokenModel.isLoggedIn, aiController.generateSkills);

// Generate tags for task
router.route('/generate-tags')
 .post(tokenModel.isLoggedIn, aiController.generateTagsForTask);

// Generate team members from description
router.route('/generate-team-members')
 .post(tokenModel.isLoggedIn, aiController.generateTeamMembersFromDescription);
 
module.exports = router;
