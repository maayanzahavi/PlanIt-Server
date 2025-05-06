const mongoose = require('mongoose');
const Task = require('../models/task');
const Skill = require('../models/skill');
const TaskComment = require('../models/taskComment');

const createTask = async (task, projectId) => {
    console.log('Creating task in service:', task);
    const newTask = new Task(task);
    newTask.project = projectId;
    newTask.comments = [];
    console.log('New task:', newTask);

    try {
        await newTask.save();
        return newTask;
    } catch (error) {
        console.error('Error creating task in service:', error);
        throw new Error('Error creating task: ' + error.message);
    }
}

const getTaskById = async (taskId) => {
    console.log('Getting task by ID in service:', taskId);
    try {
        const task = await Task.findById(taskId).populate('project').populate('tags').populate('assignedTo').populate('comments');
        if (!task) {
            console.log('Task not found');
            throw new Error('Task not found');
        }
        console.log('Task found in service:', task);
        return task;
    } catch (error) {
        console.error('Error fetching task:', error);
        throw new Error('Error fetching task: ' + error.message);
    }
}

const updateTask = async (taskId, taskData) => {
    try {
        const updatedTask = await Task.findByIdAndUpdate(taskId, taskData, { new: true }).populate('project').populate('assignedTo').populate('tags').populate('comments');
        if (!updatedTask) {
            throw new Error('Task not found');
        }
        return updatedTask;
    }
    catch (error) {
        throw new Error('Error updating task: ' + error.message);
    }
}

const deleteTask = async (taskId) => {
    try {
        const deletedTask = await Task.findByIdAndDelete(taskId);
        if (!deletedTask) {
            throw new Error('Task not found');
        }
        return deletedTask;
    } catch (error) {
        throw new Error('Error deleting task: ' + error.message);
    }
}

const getProjectTasks = async (projectId) => {
    try {
        const tasks = await Task.find({ project: projectId }).populate('project').populate('assignedTo');
        return tasks;
    } catch (error) {
        throw new Error('Error fetching tasks: ' + error.message);
    }
}

module.exports = {
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    getProjectTasks
}