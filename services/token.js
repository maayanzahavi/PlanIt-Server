const jwt = require('jsonwebtoken');

function generateResetToken(userId) {
  return jwt.sign({ id: userId }, process.env.RESET_SECRET);
}

function verifyResetToken(token) {
  return jwt.verify(token, process.env.RESET_SECRET);
}

module.exports = { generateResetToken, verifyResetToken };
