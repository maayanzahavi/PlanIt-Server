const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SkillSchema = new Schema({
    label: {
        type: String,
        required: true,
        unique: true
    }
}, { collection: 'Skills' });

module.exports = mongoose.model('Skill', SkillSchema);
