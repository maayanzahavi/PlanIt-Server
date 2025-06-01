const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    tags: [{
        type: Schema.Types.ObjectId,
        ref: 'Skill',
        default: []
    }],
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'TaskComment',
        default: []
    }],
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project'
    },
    status: {
        type: String,
        enum: ['To Do', 'In Progress', 'Done'],
        default: 'To Do'
    },
}, { collection: 'Tasks' });

module.exports = mongoose.model('Task', TaskSchema);
