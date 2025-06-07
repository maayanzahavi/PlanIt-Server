const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai');

const tokenModel = require('../models/token');



router.route('/generate-skills')
 .post(tokenModel.isLoggedIn, aiController.generateSkills);

module.exports = router;
