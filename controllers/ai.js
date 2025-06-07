const aiService = require('../services/ai');

const generateSkills = async (req, res) => {
  try {
    const { description } = req.body;
    console.log("Received request to generate skills with description:", description);

    const { skills, preferences, unmatchedSkills, unmatchedPreferences } = await aiService.generateSkillsAndPreferencesFromDescription(description);
    res.json({ skills, preferences, unmatchedSkills, unmatchedPreferences });
  } catch (error) {
    console.error("Error in controller:", error);
    res.status(500).json({ error: 'Failed to generate skills and preferences' });
  }
};

module.exports = { generateSkills };
