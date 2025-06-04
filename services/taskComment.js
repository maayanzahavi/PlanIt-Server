const TaskComment = require('../models/taskComment');
const userService = require('./user');
const notificationService = require('./notification');
const Task = require('../models/task');
const mongoose = require('mongoose');

const createTaskComment = async (taskId, username, content) => {
    console.log('Creating task comment in services:', taskId, username, content);

    try {
        // Create new comment and add it to the task
        const task = await Task.findById(taskId);
        console.log('Task found in services:', task);
        if (!task) {
            throw new Error('Task not found');
        }

        const newComment = new TaskComment({
            task: taskId,
            author: username,
            content: content,
            date: new Date()
        });
        await newComment.save();
        task.comments.push(newComment._id);
        await task.save();

        // Find the manager and team member
        const user = await userService.getUserByUsername(username);
        if (!user) {
            console.error('User not found:', username);
            throw new Error('Team member not found');
        }

        const teamMember = task.assignedTo;
        const manager = teamMember.username === username ? teamMember.manager : user;
        console.log('Manager found:', manager);
        console.log('Team member found:', teamMember);

        // Create notification for the right user
        const notifiedUser = teamMember.username === username ? manager : teamMember;
        console.log('Notified user:', notifiedUser);
        await notificationService.handleNewNotification(notifiedUser._id, `A new comment has been added to the task: ${task.title}`);

        return newComment;
    }
    catch (error) {
        console.error('Error creating task comment:', error);
        throw new Error('Error creating task comment: ' + error.message);
    }
}

const deleteTaskComment = async (commentId) => {
    console.log('Deleting task comment in services:', commentId);

    try {
        const comment = await TaskComment.findById(commentId);
        if (!comment) {
            throw new Error('Comment not found');
        }

        const task = await Task.findById(comment.task);
        if (!task) {
            throw new Error('Task not found');
        }

        // Remove the comment reference from the task
        task.comments = task.comments.filter(c => c.toString() !== commentId);
        await task.save();

        // Delete the comment itself
        await TaskComment.findByIdAndDelete(commentId);

        console.log('Comment successfully deleted');
        return comment;
    } catch (error) {
        console.error('Error deleting task comment:', error);
        throw new Error('Error deleting task comment: ' + error.message);
    }
};


const getTaskCommentById = async (commentId) => {
    console.log('Getting task comment by ID in services:', commentId);
    try {
        const comment = await TaskComment   
            .findById(commentId)
            .populate('task')
            .populate('author');    
        if (!comment) {
            console.log('Comment not found');
            throw new Error('Comment not found');
        }   
        console.log('Comment found in services:', comment);
        return comment;     
    }
    catch (error) {
        console.error('Error fetching task comment:', error);
        throw new Error('Error fetching task comment: ' + error.message);
    }               
}   
      
module.exports = {
    createTaskComment,
    deleteTaskComment
}
