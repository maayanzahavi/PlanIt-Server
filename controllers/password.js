const bcrypt = require('bcrypt');
const User = require('../models/user');
const emailService = require('../services/email');
const userService = require('../services/user');
const { generateResetToken, verifyResetToken } = require('../services/token'); 


async function sendResetLink(req, res) {
  const { email } = req.body;

  try {
   const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No user with that email exists.' });
    }

    const token = generateResetToken(user._id);
    await emailService.sendResetEmail(email, token);

    res.status(200).json({ message: 'A password reset link has been sent to your email.' });
  } catch (err) {
    console.error('[MAIL ERROR]', err);
    res.status(500).json({ message: 'Failed to send reset email' });
  }
}


async function resetPassword(req, res) {
  const { token, password } = req.body;

  try {
     const updatedUser = await userService.resetPassword(token, password)

     if(!updatedUser) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }
    
    res.status(200).json({
      message: "Password updated",
      username: updatedUser.username,
      domain: updatedUser.organization?.domain || ""
    });

  } catch (err) {
    return res.status(400).json({ message: "Invalid or expired token" });

  } 
}


module.exports = { sendResetLink, resetPassword };
