const  projectService = require('../services/projectService');

const createProject = async (req, res) => {   
    try {
        const project = await projectService.createProject(req.body, req.params.organizationId);
        res.status(201).json(project);
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

const getProjectById = async (req, res) => {
    try {
        const project = await projectService.getProjectById(req.params.id);
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
    try {
        const project = await projectService.updateProject(req.params.id, req.body);
        res.status(200).json(project);
    } catch (error) {
        if (error.message === 'Project not found') {
            res.status(404).json({ error: error.message });
        } else {
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

exports = {
    createProject,
    getProjectById,
    updateProject,
    deleteProject
}