const   Project = require('../models/project');  

const createProject = async (project , organizationId, managerId) => {
    const newProject = new Project(project);
    newProject.organization = organizationId;
    newProject.manager = managerId;
    try {
        await newProject.save();
        return newProject;
    } catch (error) {
        throw new Error('Error creating project: ' + error.message);
    }
}

const getProjectById = async (projectId) => {
    try {
        const project = await Project.findById(projectId).populate('organization').populate('manager').populate('team').populate('tasks').populate('notifications');
        if (!project) {
            throw new Error('Project not found');
        }       
        return project;
    } catch (error) {
        throw new Error('Error fetching project: ' + error.message);
    } 
}

const updateProject = async (projectId, projectData) => {     
    try {
        const updatedProject = await Project.findByIdAndUpdate(projectId, projectData, { new: true }).populate('organization').populate('manager').populate('team').populate('tasks').populate('notifications');
        if (!updatedProject) {     
            throw new Error('Project not found');
        }
        return updatedProject;
    }
    catch (error) {
        throw new Error('Error updating project: ' + error.message);
    }       
}

const deleteProject = async (projectId) => {
    try {
        const deletedProject = await Project.findByIdAndDelete(projectId);
        if (!deletedProject) {
            throw new Error('Project not found');
        }
        return deletedProject;
    } catch (error) {
        throw new Error('Error deleting project: ' + error.message);
    }
}

module.exports = {
    createProject,
    getProjectById,
    updateProject,
    deleteProject
};  