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
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true
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
    }]
}, { collection: 'Tasks' });

module.exports = mongoose.model('Task', TaskSchema);
