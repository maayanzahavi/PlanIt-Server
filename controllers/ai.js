const aiService = require('../services/ai');

const generateSkills = async (req, res) => {
  try {
    const { description } = req.body;
    const { skills, preferences } = await aiService.generateSkillsAndPreferencesFromDescription(description);
    res.json({ skills, preferences });
  } catch (error) {
    console.error("Error in controller:", error);
    res.status(500).json({ error: 'Failed to generate skills and preferences' });
  }
};

module.exports = { generateSkills };
