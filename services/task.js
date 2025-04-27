const Task = require('../models/task');

const createTask = async (taskData, projectId) => {
    const newTask = new Task(taskData);
    newTask.project = projectId;
    try {
        await newTask.save();
        return newTask;
    } catch (error) {
        throw new Error('Error creating task: ' + error.message);
    }
}

const getTaskById = async (taskId) => {
    try {
        const task = await Task.findById(taskId).populate('project').populate('tags').populate('assignedTo').populate('comments');
        if (!task) {
            throw new Error('Task not found');
        }
        return task;
    } catch (error) {
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