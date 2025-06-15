const { OpenAI } = require('openai');
const Skill = require('../models/skill');
const skillService = require('./skill');
const userService = require('./user');
const user = require('../models/user');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateSkillsAndPreferencesFromDescription(description) {
  console.log("Classifying using OpenAI:", description);

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

const generateTagsForTask = async (description) => {
  console.log("Generating tags for task description:", description);

  const systemMessage = `
You must categorize tags from the provided list into a tags array:
  - 'tags': technical abilities the person need to have for this task

  IMPORTANT: 
  - Use ONLY exact matches from the provided tags list
  - Do not create new tags or modify existing ones
  - If something doesn't match exactly, skip it

  Return strictly JSON format:
  { "tags": [...] }
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

  let tags = [];

  try {
    // Parse the OpenAI response
    const response = JSON.parse(completion.choices[0].message.content);
    console.log("OpenAI response for tags:", response);
    tags = response.tags || [];
    console.log("Generated tags:", tags);
  } catch (e) {
    console.error("Failed to parse OpenAI response for tags:", completion.choices[0].message.content);
  }

  // Fetch skills from the database based on the generated tags
  tags = await skillService.getSkillsByLabels(tags);
  console.log("Extracted tags:", tags);
  return tags;
}

const generateTeamMembersFromDescription = async (team, description) => {
  console.log("Generating team members from description:", description);

  const systemMessage = `
  You recieve a map of team members with their skills and a description of a project.
  You must categorize team members from the provided list into a teamMembers array based on the project description and their skills:
  - 'teamMembers': people who would be suitable for this project

  IMPORTANT: 
  - Use ONLY exact matches from the provided user list
  - Do not create new users or modify existing ones
  - If something doesn't match exactly, skip it

  Return strictly JSON format:
  { "teamMembers": [...] }
  `;

// Create a map of team members with their skills
const memberSkillsMap = new Map();

for (const member of team) {
  const skills = member.skills.map(skill => skill.label);
  memberSkillsMap.set(member.username, skills);
}

// Convert map to a readable string (e.g., username: skill1, skill2)
const memberSkillsMapStr = Array.from(memberSkillsMap)
  .map(([username, skills]) => `${username}: ${skills.join(', ')}`)
  .join('\n');

// Create the prompt
const userPrompt = `
You must only use usernames from this map:
${memberSkillsMapStr}

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

  let teamMembers = [];
  try {
    // Parse the OpenAI response
    const response = JSON.parse(completion.choices[0].message.content);
    console.log("OpenAI response for team members:", response);
    teamMembers = response.teamMembers || [];
    console.log("Generated team members:", teamMembers);
  } catch (e) {
    console.error("Failed to parse OpenAI response for team members:", completion.choices[0].message.content);
  }

  // Fetch users from the database based on the generated team members
  const fetchedTeamMembers = []
  for (const member of teamMembers) {
    const user = await userService.getUserByUsername(member);
    if (user) {
      fetchedTeamMembers.push(user);
    }
  }
  console.log("Extracted team members:", fetchedTeamMembers);
  return fetchedTeamMembers;
}

module.exports = {
  generateSkillsAndPreferencesFromDescription, 
  generateTagsForTask,
  generateTeamMembersFromDescription
};

