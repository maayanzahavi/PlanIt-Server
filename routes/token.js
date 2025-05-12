const tokenController = require('../controllers/token')
const express = require('express')
var router = express.Router()
console.log('[ROUTER] /api/tokens route loaded');
router.route('/').post(tokenController.processLogin)

module.exports = router