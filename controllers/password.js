const User = require('../models/user');
const bcrypt = require('bcrypt');
const { sendResetEmail } = require('../services/email');
const { generateResetToken, verifyResetToken } = require('../services/token');

async function sendResetLink(req, res) {
  const { userId, email } = req.body;

  try {
    const token = generateResetToken(userId);
    await sendResetEmail(email, token);
    res.status(200).send("Reset email sent");
  } catch (err) {
    console.error("[MAIL ERROR]", err); 

    res.status(500).send("Failed to send reset email");
  }
}

async function resetPassword(req, res) {
  const { token, password } = req.body;

  try {
    const decoded = verifyResetToken(token);
    const hashed = await bcrypt.hash(password, 10);
    const updatedUser = await User.findByIdAndUpdate(decoded.id, { password: hashed }, { new: true })
      .populate('organization');
    
    if (!updatedUser) return res.status(404).send("User not found");

    res.status(200).json({
      message: "Password updated",
      username: updatedUser.username,
      domain: updatedUser.organization?.domain || ""
    });

  } catch (err) {
    res.status(400).send("Invalid or expired token");
  } 
}


module.exports = { sendResetLink, resetPassword };
