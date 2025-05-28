const tokenModel = require('../models/token.js')
const userService = require('../services/user.js')

//check if the login was succesful
async function processLogin(req, res) {
    console.log('[CONTROLLER] token controller loaded');
    const username = req.body.username
    const password = req.body.password
    if (await userService.isSigned(username, password) == false) {
        console.log('Invalid username and/or password')
        res.status(404).json( { error: 'Invalid username and/or password' } )
    } else {
        console.log('Login successful')
        res.status(201).json( { token: tokenModel.getToken(req) } )
    }
}

module.exports = { processLogin }