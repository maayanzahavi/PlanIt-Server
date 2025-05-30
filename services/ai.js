require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const Skill = require('../models/skill');
const HF_API_KEY = process.env.HF_API_KEY;

const generateSkillsAndPreferencesFromDescription = async (description) => {
  console.log("Entered generateSkillsAndPreferencesFromDescription");

  const allSkills = await Skill.find();
  const skillLabels = allSkills
    .filter(skill => typeof skill.label === 'string')
    .map(skill => skill.label.trim().toLowerCase());

  const response = await fetch(
    'https://api-inference.huggingface.co/models/dslim/bert-base-NER',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: description }),
    }
  );

  const rawText = await response.text();
  console.log("Raw HF response:", rawText);

  let nerResult;
  try {
    nerResult = JSON.parse(rawText);
  } catch (err) {
    throw new Error("Failed to parse HuggingFace response as JSON");
  }

  const nerWords = [...new Set(
    nerResult
      .map(e => e.word?.replace(/^##/, '').toLowerCase())
      .filter(Boolean)
  )];

  const matchedFromNER = skillLabels.filter(skill =>
    nerWords.includes(skill)
  );

  const matchedFromText = skillLabels.filter(skill =>
    description.toLowerCase().includes(skill)
  );

  const combined = [...new Set([...matchedFromNER, ...matchedFromText])];

  const newSkills = nerWords.filter(word =>
    !combined.includes(word) && !skillLabels.includes(word)
  );

  for (const newSkill of newSkills) {
    const skillDoc = new Skill({ label: newSkill });
    await skillDoc.save().catch(() => {}); 
    combined.push(newSkill);
  }

  const preferences = [];
  const skills = [];

  for (const skill of combined) {
    const idx = description.toLowerCase().indexOf(skill);
    const beforeText = description.toLowerCase().substring(0, idx);

    if (
      beforeText.includes("prefer") ||
      beforeText.includes("interested in") ||
      beforeText.includes("comfortable with")
    ) {
      preferences.push(skill);
    } else {
      skills.push(skill);
    }
  }

  console.log("🎯 Skills:", skills);
  console.log("🎯 Preferences:", preferences);

  return { skills, preferences };
};

module.exports = {
  generateSkillsAndPreferencesFromDescription,
};
