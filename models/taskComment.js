const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskCommentSchema = new Schema({
    task: {
        type: Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    author: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { collection: 'TaskComments' });

module.exports = mongoose.model('TaskComment', TaskCommentSchema);
