const Project = require('../models/project');  
const userService = require('./user');
const Task = require('../models/task');
const notificationService = require('./notification');
const taskService = require('./task');
const mongoose = require('mongoose');

const createProject = async (project , organizationId, managerId) => {
    console.log('Creating project in service:', project.title);
    const newProject = new Project(project);
    console.log('New project:', newProject.title);
    newProject.organization = organizationId;
    newProject.manager = managerId;
    
    try {
        await newProject.save();
        // Change addTasksToProject to addProjectToTasks
        if (project.tasks && project.tasks.length > 0) {
            await addProjectToTasks(newProject._id, newProject.tasks);
        }

        if (project.team && project.team.length > 0) {
            // Add project to each team member
            await addProjectToUsers(newProject._id, [...project.team, managerId]);
        }
        return newProject;
    } catch (error) {
        console.error('Error creating project in service:', error);
        throw new Error('Error creating project: ' + error.message);
    }
}

const getProjectById = async (projectId) => {
    try {
        const project = await Project.findById(projectId)
            .populate('manager')
            .populate('team')
            .populate({
                path: 'tasks',
                populate: [
                    { path: 'assignedTo' },
                    { path: 'tags' }
                ]
            });
        if (!project) {
            throw new Error('Project not found');
        }       
        return project;
    } catch (error) {
        throw new Error('Error fetching project: ' + error.message);
    } 
}

const updateProject = async (projectId, project) => {    
    console.log('Updating project in service:', project.title); 

    try {
        const updatedProject = await Project.findByIdAndUpdate(projectId, project, { new: true })
            .populate('manager')
            .populate('team')
            .populate({
                path: 'tasks',
                populate: [
                    { path: 'assignedTo' },
                    { path: 'tags' }
                ]
            });
        if (!updatedProject) {     
            console.log('Project not found');
            throw new Error('Project not found');
        }
        console.log('Updated project:', updatedProject.title);
        return updatedProject;
    }
    catch (error) {
        console.error('Error updating project:', error);
        throw new Error('Error updating project: ' + error.message);
    }       
}

const deleteProject = async (projectId) => {
    try {
      const project = await Project.findById(projectId);
      if (!project) {
        throw new Error('Project not found');
      }
  
      //Delete all tasks associated with the project
      if (Array.isArray(project.tasks)) {
        for (const taskId of project.tasks) {
          await taskService.deleteTask(taskId.toString()); 
        }
      }
  
      //Remove the project from all users
      await userService.removeProjectFromUsers(projectId);
  
    
      // Delete the project itself
      await Project.findByIdAndDelete(projectId);
  
      console.log(`Project ${projectId} deleted successfully`);
      return true;
    } catch (error) {
      console.error('Error deleting project:', error.message);
      throw new Error('Error deleting project: ' + error.message);
    }
  };

const addTasksToProject = async (project, tasks) => {
    console.log('Adding tasks to project in service:', project._id);
    console.log('Tasks:', tasks);
    try {
        const updatedProject = await Project.findByIdAndUpdate(
            project._id, 
            { $push: { tasks: { $each: tasks } } }, 
            { new: true }
        )
        .populate('manager')
        .populate('team')
        .populate({
            path: 'tasks',
            populate: [
                { path: 'assignedTo' },
                { path: 'tags' }
            ]
        });
        if (!updatedProject) {
            console.log('Project not found');
            throw new Error('Project not found');
        }
        console.log('Updated project with tasks:', updatedProject.title);
        return updatedProject;
    } catch (error) {
        console.error('Error adding tasks to project:', error);
        throw new Error('Error adding tasks to project: ' + error.message);
    }
}

const removeTaskFromProject = async (projectId, taskId) => {
    console.log('Removing task from project in service:', projectId);
    try {
        const updatedProject = await Project.findByIdAndUpdate(projectId, { $pull: { tasks: taskId } }, { new: true }).populate('manager').populate('team').populate('tasks');
        if (!updatedProject) {
            console.log('Project not found');
            throw new Error('Project not found');
        }
        console.log('Updated project after removing task:', updatedProject);
        return updatedProject;  
    } catch (error) {
        console.error('Error removing task from project:', error);
        throw new Error('Error removing task from project: ' + error.message);
    }
}

const addProjectToTasks = async (projectId, tasks) => {
    console.log('Adding project to tasks in service:', projectId);
    console.log('Tasks:', tasks);
    try {
        const updatedTasks = await Promise.all(tasks.map(async (taskId) => {
            const task = await Task.findById(taskId);
            if (!task) {
              console.warn(`Task not found: ${taskId}`);
              return null;
            }
        
            task.project = projectId;
            return await task.save();
        }));
        
        console.log('Updated tasks with project:', updatedTasks);
        return updatedTasks;
    } catch (error) {
        console.error('Error adding project to tasks:', error);
        throw new Error('Error adding project to tasks: ' + error.message);
    }
}

const addTasksToUsers = async (tasks, team) => {
    console.log('Adding tasks to users in service:', team);
    console.log('Tasks:', tasks);

    try {
        const tasksAsObjectIds = tasks.map(id => new mongoose.Types.ObjectId(id));
        const fetchedTasks = await Task.find({ _id: { $in: tasksAsObjectIds } });
        console.log('Fetched tasks:', fetchedTasks);
        
        for (const member of team) {
            const memberId = member._id?.toString() || member.toString();
            const memberTasks = fetchedTasks.filter(task => task.assignedTo.toString() === memberId);
            if (memberTasks.length > 0) {
                console.log('Adding tasks to user:', memberId, 'Tasks:', memberTasks);
                await userService.addTasksToUser(memberId, memberTasks.map(task => task._id));
            }
        }
    }
    catch (error) {
        console.error('Error adding tasks to users:', error);
        throw new Error('Error adding tasks to users: ' + error.message);
    }
};

const addProjectToUsers = async (projectId, team) => {
    console.log('Adding project to users in service:', projectId);
    console.log('Team:', team);

    try {
        for (const member of team) {
            console.log('Adding project to user:', member._id);
            await userService.addProjectToUser(member._id, projectId);
        }
    } catch (error) {
        console.error('Error adding project to users:', error);
        throw new Error('Error adding project to users: ' + error.message);
    }
}
            

const sendAssignmentsNotification = async (projectId, initialAssignments) => {
    console.log('Sending assignment notifications for project:', projectId);
    console.log('Initial assignments:', initialAssignments);
    try {
        if (!projectId) {
            throw new Error('Project ID is required');
        }

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            throw new Error('Invalid project ID format');
        }

        const project = await getProjectById(projectId)

        if (!project) {
            throw new Error('Project not found');
        }

        // Create a map to track initial assignments
        const initialTasksAssignmentsMap = new Map();
        for (const task of initialAssignments) {
            if (task.assignedTo) {
                initialTasksAssignmentsMap.set(task._id.toString(), task.assignedTo._id.toString());
            } else {
                initialTasksAssignmentsMap.set(task._id.toString(), null);
            }
        }
        console.log('Initial tasks assignments map:', initialTasksAssignmentsMap);

        for (const task of project.tasks) {
            // Check if the task assignment has changed and notify the user if it has
            const isChangeAssignment = initialTasksAssignmentsMap.get(task._id.toString()) !== task.assignedTo?._id?.toString();
            console.log('Task:', task._id, 'Assigned to:', task.assignedTo?._id, 'Is change assignment:', isChangeAssignment);
            if (task.assignedTo && isChangeAssignment) {
                console.log('Sending assignment notification for user:', task.assignedTo._id, 'task:', task.title);
                const content = `You have been assigned to the task: ${task.title}`;
                await notificationService.handleNewNotification(task.assignedTo._id, content);
            }
        }
    } catch (error) {
        console.error('Error sending assignment notifications:', error);
        throw new Error('Error sending assignment notifications: ' + error.message);
    }
}

module.exports = {
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
    addTasksToProject,
    removeTaskFromProject,
    sendAssignmentsNotification
};