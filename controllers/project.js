const  projectService = require('../services/project');
const taskService = require('../services/task');
const userService = require('../services/user');
const organizationService = require('../services/organization');
const project = require('../models/project');

const createProject = async (req, res) => {   
    console.log('Creating project:', req.body);
    const { domain, username } = req.params;
    const newProject = req.body;

    console.log('Domain:', domain);
    console.log('Username:', username);
    console.log('Project tasks:', newProject.tasks);
    console.log('Project members:', newProject.team);

    // Make project tasks an array of task IDs
    const tempTasks = newProject.tasks || [];
    newProject.tasks = tempTasks.map(task => task._id);

    // Create project
    try {
        // Find manager by username in order to get their ID
        const manager = await userService.getUserByUsername(username);
        if (!manager) {
            return res.status(400).json({ error: 'Manager not found' });
        } else {
            console.log('Manager found');
        }
        
        // Find organization by domain in order to get its ID
        const organization = await organizationService.getOrganizationByDomain(domain);
        if (!organization) {
            return res.status(400).json({ error: 'Organization not found' });
        } else {
            console.log('Organization found');
        }

        console.log('Creating project for organization:', organization._id);
        console.log('Creating project for manager:', manager._id);

        // Save project with organization and manager
        const project = await projectService.createProject(newProject, organization._id, manager._id);
        if (!project) {
            return res.status(400).json({ error: 'Project creation failed' });
        }
        console.log('Project created:', project._id);
        res.status(201).json(project);

    } catch (error) {
        if (error.name === 'ValidationError') {
            console.error('Validation error:', error);
            res.status(400).json({ error: error.message });
        } else {
            console.error('Error creating project:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

const getProjectById = async (req, res) => {
    const { domain, username, projectId } = req.params;
    try {
        const project = await projectService.getProjectById(projectId);
        res.status(200).json(project);
    } catch (error) {
        if (error.message === 'Project not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

const updateProject = async (req, res) => {
    console.log('Updating project:', req.body);
    const { domain, username, projectId } = req.params;
    console.log('Project ID:', projectId);

    try {
        const project = await projectService.updateProject(projectId, req.body);
        console.log('Project updated:', projectId);
        res.status(200).json(project);
    } catch (error) {
        if (error.message === 'Project not found') {
            console.log('Project not found:', projectId);
            res.status(404).json({ error: error.message });
        } else {
            console.error('Error updating project:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

const deleteProject = async (req, res) => {
    const { projectId } = req.params;
  
    try {
      const result = await projectService.deleteProject(projectId);
      if (result) {
        return res.status(200).json({ message: 'Project deleted successfully' });
      }
    } catch (error) {
      if (error.message.includes('Project not found')) {
        return res.status(404).json({ error: error.message });
      } else {
        return res.status(500).json({ error: 'Internal Server Error' });
      }
    }
  };

  const resetAllTasksAssignments = async (req, res) => {
    const { projectId } = req.params;
    try {
        const project = await projectService.getProjectById(projectId);
        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }   

        const updatedProject = await projectService.resetAllTasksAssignments(projectId);
        res.status(200).json(updatedProject);
    } catch (error) {
        console.error('Error resetting task assignments:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
    resetAllTasksAssignments
}