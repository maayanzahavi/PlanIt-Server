const skillService = require('../services/skill');

const getAllSkills = async (req, res) => {
    try {
        const skills = await skillService.getAllSkills();
        res.status(200).json(skills);
    } catch (error) {
        console.error('Error fetching skills:', error);
        res.status(500).json({ error: 'Error fetching skills' });
    }
}

const createSkill = async (req, res) => {
    console.log('Creating skill with body:', req.body);
    const { label } = req.body;   
    if (!label) {
        return res.status(400).json({ error: 'Label is required' });
    }       
    try {
        const skill = await skillService.createSkill(label);
        res.status(201).json(skill);
    } catch (error) {
        console.error('Error creating skill:', error);
        res.status(500).json({ error: 'Error creating skill' });
    }
}
module.exports = {
    getAllSkills,
    createSkill
}