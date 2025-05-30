const aiService = require('../services/ai'); // תקני

const generateSkills = async (req, res) => {
  try {
    const { description } = req.body;
    const skills = await aiService.generateSkillsFromDescription(description);
    res.json({ skills });
  } catch (error) {
    console.error("Error in controller:", error);
    res.status(500).json({ error: 'Failed to generate skills' });
  }
};

module.exports = { generateSkills };
