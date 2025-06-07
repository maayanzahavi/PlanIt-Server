const { OpenAI } = require('openai');
const Skill = require('../models/skill');
const skillService = require('./skill');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateSkillsAndPreferencesFromDescription(description) {
  console.log("Classifying using OpenAI:", description);

//   const systemMessage = `
// You are an assistant that receives a short text describing a new team member and a list of available skill tags.
// From this text, extract two lists from the available tags:
// - 'skills': actual skills or technologies the person has
// - 'preferences': things the person prefers, enjoys, or is interested in

// Respond ONLY with a JSON object like:
// {
//   "skills": [...],
//   "preferences": [...]
// }
// Do not include anything else.
// `;

  const systemMessage = `
  You must categorize tags from the provided list into two arrays:
  - 'skills': technical abilities the person currently has
  - 'preferences': technologies or areas they enjoy working with

  IMPORTANT: 
  - Use ONLY exact matches from the provided tags list
  - Do not create new tags or modify existing ones
  - If something doesn't match exactly, skip it

  Return strictly JSON format:
  { "skills": [...], "preferences": [...] }
  `;

  const existingSkills = await Skill.find();
  const skillLabels = existingSkills.map(skill => skill.label);

  const userPrompt = `
You must only use tags from this list:
${skillLabels.join(', ')}

Description to analyze:
${description}
`;

// API call to OpenAI to classify the description
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemMessage },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.2
  });

  let skills = [];
  let preferences = [];

  try {
    // Parse the OpenAI response
    const response = JSON.parse(completion.choices[0].message.content);
    console.log("OpenAI response:", response);
    const skillLabels = response.skills || [];
    const preferenceLabels = response.preferences || [];

    console.log("Extracted skills:", skillLabels);
    console.log("Extracted preferences:", preferenceLabels);
    
    skills = await skillService.getSkillsByLabels(skillLabels);
    preferences = await skillService.getSkillsByLabels(preferenceLabels);

    // Save unmatched skills and preferences
    unmatchedSkills = skillLabels.filter(label => !skills.some(skill => skill.label === label)) || []; 
    unmatchedPreferences = preferenceLabels.filter(label => !preferences.some(pref => pref.label === label)) || [];

  } catch (e) {
    console.error("Failed to parse OpenAI response:", completion.choices[0].message.content);
  }

  console.log("Skills:", skills);
  console.log("Preferences:", preferences);
  console.log("Unmatched skills:", unmatchedSkills);
  console.log("Unmatched preferences:", unmatchedPreferences);

  return { skills, preferences, unmatchedSkills, unmatchedPreferences };
}

module.exports = {
  generateSkillsAndPreferencesFromDescription,
};
