const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai');

router.post('/generate-skills', aiController.generateSkills);

module.exports = router;
