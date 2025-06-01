const mongoose = require('mongoose');
const Task = require('../models/task');
const userService = require('./user');
const projectService = require('./project');
const Project = require('../models/project');
require('../models/skill');
require('../models/taskComment');   

const createTask = async (task) => {
    console.log('Creating task in service:', task);
    const newTask = new Task(task);
    newTask.comments = [];
    console.log('New task:', newTask);

    try {
        await newTask.save();
        const populatedTask = await Task.findById(newTask._id).populate('tags');
        return populatedTask;
    } catch (error) {
        console.error('Error creating task in service:', error);
        throw new Error('Error creating task: ' + error.message);
    }
}

const getTaskById = async (taskId) => {
    console.log('Getting task by ID in service:', taskId);
    try {
        const task = await Task.findById(taskId).populate('tags').populate('assignedTo').populate('comments');
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
    console.log('Updating task in service:', taskId, taskData);
    try {
        const updatedTask = await Task.findByIdAndUpdate(taskId, taskData, { new: true }).populate('assignedTo').populate('tags').populate('comments');
        if (!updatedTask) {
            throw new Error('Task not found');
        }
        return updatedTask;
    }
    catch (error) {
        console.error('Error updating task:', error);
        throw new Error('Error updating task: ' + error.message);
    }
}

const deleteTask = async (taskId) => {
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        console.log("No task found to delete:", taskId);
        throw new Error('Task not found');
      }
  
      console.log("Task to delete:", task._id);
  
      if (task.assignedTo) {
        console.log("Removing task from user:", task.assignedTo);
        await userService.removeTaskFromUser(task.assignedTo, taskId);
      }
  
      if (task.project) {
        console.log("Removing task from project:", task.project);
        await Project.findByIdAndUpdate(task.project, {
          $pull: { tasks: taskId }
        });
      }
      
  
      await Task.findByIdAndDelete(taskId);
      console.log(`Task ${taskId} deleted successfully`);
      
      return task;
    } catch (error) {
      console.error('Error deleting task:', error.message);
      throw new Error('Error deleting task: ' + error.message);
    }
  };
  
  

const getProjectTasks = async (projectId) => {
    try {
        const tasks = await Task.find({ project: projectId }).populate('assignedTo');
        return tasks;
    } catch (error) {
        throw new Error('Error fetching tasks: ' + error.message);
    }
}


const changeTaskStatus = async (taskId, status) => {
    console.log('Changing task status in service:', taskId, status);
    try {
        const updatedTask = await Task.findByIdAndUpdate(
            taskId, 
            { status }, 
            { new: true }
        ).populate('assignedTo').populate('tags').populate('comments');
        
        if (!updatedTask) {
            throw new Error('Task not found');
        }

        // Update project progress after task status change
        if (updatedTask.project) {
            await projectService.updateProjectProgress(updatedTask.project);
        }

        return updatedTask;
    }
    catch (error) {
        console.error('Error updating task status:', error);
        throw new Error('Error updating task status: ' + error.message);
    }
}

module.exports = {
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    getProjectTasks,
    changeTaskStatus
}