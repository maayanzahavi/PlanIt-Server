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


const getSkillsByLabels = async (labels = []) => {
    
    try {
        const skills = await Skill.find({ label: { $in: labels } });
        return skills;
    } catch (error) {
        console.error('Error fetching skills by labels:', error);
        throw new Error('Error fetching skills by labels: ' + error.message);
    }
}
  

const createSkill  = async (label) => {
    console.log('Creating skill with label:', label);
    try {
        const skill = new Skill({ label });
        await skill.save();
        return skill;
    } catch (error) {
        console.error('Error creating skill:', error);
        throw new Error('Error creating skill: ' + error.message);
    }
}
module.exports = {
    getAllSkills,
    getSkillsByLabels,
    createSkill
}