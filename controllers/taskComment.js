const taskCommentService = require('../services/taskComment');

const createTaskComment = async (req, res) => {
    console.log('Creating task comment in controller:', req.body);
    const { domain, username, projectId, taskId } = req.params;
    const { content } = req.body;
    console.log('Content:', content);
    console.log('Domain:', domain);
    console.log('Username:', username);
    console.log('Project ID:', projectId);
    console.log('Task ID:', taskId);

    try {
        const comment = await taskCommentService.createTaskComment(taskId, username, content);
        if (!comment) {
            console.log('Comment creation failed');
            return res.status(400).json({ error: 'Comment creation failed' });
        }
        console.log('Comment created:', comment._id);
        res.status(201).json(comment);
    } catch (error) {
        if (error.message === 'Task not found') {
            console.log('Task not found');
            res.status(404).json({ error: error.message });
        } else {
            console.error('Error creating task comment:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

const deleteTaskComment = async (req, res) => {
    console.log('Deleting task comment:', req.params.commentId);
    const { domain, username, projectId, taskId, commentId } = req.params;
    console.log('Domain:', domain);
    console.log('Username:', username);
    console.log('Project ID:', projectId);
    console.log('Task ID:', taskId);
    console.log('Comment ID:', commentId);

    try {
        const comment = await taskCommentService.deleteTaskComment(commentId);
        if (!comment) {
            console.log('Comment deletion failed');
            return res.status(400).json({ error: 'Comment deletion failed' });
        }
        console.log('Comment deleted:', comment._id);
        res.status(200).json(comment);
    } catch (error) {
        if (error.message === 'Comment not found') {
            console.log('Comment not found');
            res.status(404).json({ error: error.message });
        } else {
            console.error('Error deleting task comment:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = {
    createTaskComment,
    deleteTaskComment
}