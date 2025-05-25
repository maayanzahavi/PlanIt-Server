const express = require('express');
const router = express.Router();
const passwordController = require('../controllers/password');

router.post('/send-reset-email', passwordController.sendResetLink);
router.post('/reset-password', passwordController.resetPassword);


module.exports = router;
