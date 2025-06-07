const { OpenAI } = require('openai');
const Skill = require('../models/skill');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateSkillsAndPreferencesFromDescription(description) {
  console.log("Classifying using OpenAI:", description);

  const systemMessage = `
You are an assistant that receives a short text describing a new team member.
From this text, extract two lists:
- One for 'skills' (technologies or abilities the person has)
- One for 'preferences' (things the person prefers, likes or enjoys)

Return a JSON object with two arrays: 'skills' and 'preferences'.
Only return the object, no explanation.
`;

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: description }
    ],
    temperature: 0.2
  });

  let skills = [];
  let preferences = [];

  try {
    const response = JSON.parse(completion.choices[0].message.content);
    skills = response.skills || [];
    preferences = response.preferences || [];
  } catch (e) {
    console.error("Failed to parse OpenAI response:", completion.choices[0].message.content);
  }

  const existingSkills = await Skill.find();
  const existingLabels = existingSkills.map(s => s.label.toLowerCase());

  const newTags = [...skills, ...preferences]
    .filter(tag => !existingLabels.includes(tag.toLowerCase()));

  for (const tag of newTags) {
    const newSkill = new Skill({ label: tag });
    await newSkill.save();
  }

  console.log("Skills:", skills);
  console.log("Preferences:", preferences);

  return { skills, preferences };
}

module.exports = {
  generateSkillsAndPreferencesFromDescription,
};
