const Skill = require('../models/skill');

const getAllSkills = async () => {
    try {
        const skills = await Skill.find();
        return skills;
    } catch (error) {
        console.error('Error fetching skills:', error);
        throw new Error('Error fetching skills: ' + error.message);
    }
}

const getOrCreateSkillsByLabels = async (labels = []) => {
    const normalized = [...new Set(
      labels.map(s => typeof s === 'string' ? s : s.label).filter(Boolean)
    )];
  
    const existingSkills = await Skill.find({ label: { $in: normalized } });
    const existingLabels = existingSkills.map(s => s.label);
  
    const newLabels = normalized.filter(label => !existingLabels.includes(label));
    const newSkills = await Skill.insertMany(newLabels.map(label => ({ label })));
  
    return [...existingSkills, ...newSkills];
  };

const getSkillsByLabels = async (labels = []) => {
    
    try {
        const skills = await Skill.find({ label: { $in: labels } });
        return skills;
    } catch (error) {
        console.error('Error fetching skills by labels:', error);
        throw new Error('Error fetching skills by labels: ' + error.message);
    }
}
  
module.exports = {
    getAllSkills,
    getOrCreateSkillsByLabels,
    getSkillsByLabels
}