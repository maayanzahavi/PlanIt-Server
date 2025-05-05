const Project = require('../models/project');  

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
        const project = await Project.findById(projectId).populate('organization').populate('manager').populate('team').populate('tasks').populate('notifications');
        if (!project) {
            throw new Error('Project not found');
        }       
        return project;
    } catch (error) {
        throw new Error('Error fetching project: ' + error.message);
    } 
}

const updateProject = async (project) => {    
    console.log('Updating project in service:', project._id); 

    try {
        const updatedProject = await Project.findByIdAndUpdate(project._id, project, { new: true }).populate('manager').populate('team').populate('tasks');
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
        const deletedProject = await Project.findByIdAndDelete(projectId);
        if (!deletedProject) {
            throw new Error('Project not found');
        }
        return deletedProject;
    } catch (error) {
        throw new Error('Error deleting project: ' + error.message);
    }
}

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

module.exports = {
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
    addTasksToProject
};  