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

module.exports = {
    getAllSkills
}