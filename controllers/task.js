const taskController = require('../controllers/task');

const createTask = async (req, res) => {
    try {
        const task = await taskController.createTask(req.body, req.params.projectId);
        res.status(201).json(task);
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

const getTaskById = async (req, res) => {
    try {
        const task = await taskController.getTaskById(req.params.taskId);
        res.status(200).json(task);
    } catch (error) {
        if (error.message === 'Task not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

const updateTask = async (req, res) => {
    try {
        const task = await taskController.updateTask(req.params.taskId, req.body);
        res.status(200).json(task);
    } catch (error) {
        if (error.message === 'Task not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

const deleteTask = async (req, res) => {
    try {
        const task = await taskController.deleteTask(req.params.taskId);
        res.status(200).json(task);
    } catch (error) {
        if (error.message === 'Task not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

const getProjectTasks = async (req, res) => {
    try {
        const tasks = await taskController.getProjectTasks(req.params.projectId);
        res.status(200).json(tasks);
    } catch (error) {
        if (error.message === 'Tasks not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = {
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    getProjectTasks
}