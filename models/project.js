const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    manager: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    team: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    tasks: [{
        type: Schema.Types.ObjectId,
        ref: 'Task',
        default: []
    }],
    progress: {
        type: Number,
        default: 0 // Typically a number between 0-100
    },
    deadline: {
        type: Date,
        required: false // Optional: can be added later
    }
}, { collection: 'Projects' });

module.exports = mongoose.model('Project', ProjectSchema);
