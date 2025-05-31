const User = require('../models/user');
const { sendResetEmail } = require('../services/email');
const { generateResetToken } = require('../services/token');

async function sendResetLink(req, res) {
  const { email } = req.body;

  try {
   const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'No user with that email exists.' });
    }

    const token = generateResetToken(user._id); 
    await sendResetEmail(email, token);

    res.status(200).json({ message: 'A password reset link has been sent to your email.' });
  } catch (err) {
    console.error('[MAIL ERROR]', err);
    res.status(500).json({ message: 'Failed to send reset email' });
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
