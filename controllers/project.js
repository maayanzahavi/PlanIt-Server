const  projectService = require('../services/project');
const taskService = require('../services/task');
const userService = require('../services/user');
const organizationService = require('../services/organization');
const project = require('../models/project');

const createProject = async (req, res) => {   
    console.log('Creating project:', req.body);
    const { domain, username } = req.params;
    console.log('Domain:', domain);
    console.log('Username:', username);
    const newProject = req.body;

    // Move tasks to a separate variable
    // and clear the tasks array in the project object
    const tasks = newProject.tasks || [];
    console.log('Project tasks:', tasks);
    console.log('Project members:', project.team);
    newProject.tasks = [];

    try {
        // Create project
        const manager = await userService.getUserByUsername(username);
        if (!manager) {
            return res.status(400).json({ error: 'Manager not found' });
        } else {
            console.log('Manager found');
        }
        
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

        // Create tasks
        const taskIds = [];
        if (tasks && tasks.length > 0) {
            for (const t of tasks) {
                // Create task
                console.log('Creating task:', t);
                const task = await taskService.createTask(t, project._id);
                if (!task) {
                    console.log('Task creation failed');
                    return res.status(400).json({ error: 'Task creation failed' });
                }
                console.log('Task created:', task._id);

                // Add task ID to tasks array
                taskIds.push(task._id);
                console.log('Task added to project:', task._id);
                console.log('Project tasks:', project.tasks);
            }
        }
        // Save project with tasks
        const projectWithTasks = await projectService.addTasksToProject(project, taskIds);
        if (!projectWithTasks) {
            console.log('Project update failed');
            return res.status(400).json({ error: 'Project update failed' });
        }

        console.log('Project with tasks:', projectWithTasks._id);
        res.status(201).json(projectWithTasks);

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
    try {
        await projectService.deleteProject(req.params.id);
        res.status(204).send();
    } catch (error) {
        if (error.message === 'Project not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = {
    createProject,
    getProjectById,
    updateProject,
    deleteProject
}