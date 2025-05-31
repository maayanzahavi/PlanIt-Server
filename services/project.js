const Project = require('../models/project');  
const userService = require('./user');
const taskService = require('./task');
const taskCommentService = require('./taskComment');


const createProject = async (project , organizationId, managerId) => {
    console.log('Creating project in service:', project);
    const newProject = new Project(project);
    console.log('New project:', newProject);
    newProject.organization = organizationId;
    newProject.manager = managerId;
    
    try {
        await newProject.save();
        return newProject;
    } catch (error) {
        console.error('Error creating project in service:', error);
        throw new Error('Error creating project: ' + error.message);
    }
}

const getProjectById = async (projectId) => {
    try {
        const project = await Project.findById(projectId).populate('manager').populate('team').populate('tasks');
        if (!project) {
            throw new Error('Project not found');
        }       
        return project;
    } catch (error) {
        throw new Error('Error fetching project: ' + error.message);
    } 
}

const updateProject = async (projectId, project) => {    
    console.log('Updating project in service:', project); 

    try {
        const updatedProject = await Project.findByIdAndUpdate(projectId, project, { new: true }).populate('manager').populate('team').populate('tasks');
        if (!updatedProject) {     
            console.log('Project not found');
            throw new Error('Project not found');
        }
        console.log('Updated project:', updatedProject);
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
        const updatedProject = await Project.findByIdAndUpdate(project._id, { $push: { tasks: { $each: tasks } } }, { new: true }).populate('manager').populate('team').populate('tasks');
        if (!updatedProject) {
            console.log('Project not found');
            throw new Error('Project not found');
        }
        console.log('Updated project with tasks:', updatedProject);
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

module.exports = {
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
    addTasksToProject,
    removeTaskFromProject
};