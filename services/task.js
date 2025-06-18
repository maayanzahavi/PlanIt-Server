const mongoose = require('mongoose');
const Task = require('../models/task');
require('../models/user');
const notificationService = require('./notification');
require('../models/skill');
require('../models/taskComment');   
require('../server');
const Project = require('../models/project')

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
        console.warn(`No task found to delete: ${taskId}`);
        return; 
        }

  
      // Delete task from user's tasks if assigned
      if (task.assignedTo) {
        const userService = require('./user');
        await userService.removeTaskFromUser(task.assignedTo, taskId);
      }
  
      // Remove task from project's tasks if it belongs to a project
      if (task.project) {
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
        const tasks = await Task.find({ project: projectId })
            .populate('assignedTo')
            .populate('tags');
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
            await updateProjectProgress(updatedTask.project);
        }

        // Notify manager about task status change
        await notificationService.handleNewNotification(
            updatedTask.assignedTo.manager, 
            `Task ${updatedTask.title} status changed to ${status}`
        );
        
        return updatedTask;
    }
    catch (error) {
        console.error('Error updating task status:', error);
        throw new Error('Error updating task status: ' + error.message);
    }
}

const updateProjectProgress = async (projectId) => {
    try {
        const project = await Project.findById(projectId).populate('tasks');
        if (!project) {
            throw new Error('Project not found');
        }

        const totalTasks = project.tasks.length;
        if (totalTasks === 0) {
            project.progress = 0;
        } else {
            const completedTasks = project.tasks.filter(task => task.status === 'Done').length;
            project.progress = Math.round((completedTasks / totalTasks) * 100);
        }

        await project.save();
        return project;
    } catch (error) {
        console.error('Error updating project progress:', error);
        throw new Error('Error updating project progress: ' + error.message);
    }
}

const assignTaskToUser = async (taskId, userId) => {
    console.log('Assigning task to user in service:', taskId, userId);
    try {
        // Fetch the user and the task
        const task = await Task.findById(taskId).populate('assignedTo');
        if (!task) {
            throw new Error('Task not found');
        }
        const userService = require('./user');
        const user = await userService.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // If the task is already assigned to a user, remove the task from their tasks
        if (task.assignedTo) {
            const userService = require('./user');
            await userService.removeTaskFromUser(task.assignedTo, taskId);
        }

        // Add the task to the tasks list of the new user
        user.tasks.push(task._id);
        await user.save();

        // Change assignment in task
        task.assignedTo = userId;
        await task.save();

        return task;
    }
    catch (error) {
        console.error('Error assigning task to user:', error);
        throw new Error('Error assigning task: ' + error.message);
    }
}

module.exports = {
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    getProjectTasks,
    changeTaskStatus,
    assignTaskToUser,
}