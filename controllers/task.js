const taskService = require('../services/task');  

const createTask = async (req, res) => {
    console.log('Creating task in controller:', req.body);
    const { domain, username, projectId } = req.params;
    try {
        const task = await taskService.createTask(req.body);
        res.status(201).json(task);
    } catch (error) {
        if (error.name === 'ValidationError') {
            console.error('Validation error:', error);
            res.status(400).json({ error: error.message });
        } else {
            console.error('Error creating task:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

const getTaskById = async (req, res) => {
    console.log('Getting task by ID:', req.params.taskId);
    const { domain, username, projectId, taskId } = req.params;
    console.log('Getting task by ID:', taskId);
    try {
        const task = await taskService.getTaskById(taskId);
        if (!task) {
            console.log('Task not found');
            return res.status(404).json({ error: 'Task not found' });
        }
        console.log('Task found:', task);
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
    console.log('Updating task in controller:', req.params.taskId, req.body);
    try {
        const task = await taskService.updateTask(req.params.taskId, req.body);
        res.status(200).json(task);
    } catch (error) {
        if (error.message === 'Task not found') {
            console.log('Task not found:', req.params.taskId);
            res.status(404).json({ error: error.message });
        } else {
            console.error('Error updating task:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

const deleteTask = async (req, res) => {
    console.log("=== deleteTask controller called ===");
console.log("params:", req.params);
    const taskId = req.params.taskId;

    try {
        const deletedTask = await taskService.deleteTask(taskId);
        res.status(200).json({ message: 'Task deleted successfully', task: deletedTask });
    } catch (error) {
        if (error.message === 'Task not found') {
            res.status(404).json({ error: error.message });
        } else {
            console.error('Error deleting task:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

const getProjectTasks = async (req, res) => {
    try {
        const tasks = await taskService.getProjectTasks(req.params.projectId);
        res.status(200).json(tasks);
    } catch (error) {
        if (error.message === 'Tasks not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

const changeTaskStatus = async (req, res) => {
    console.log('Changing task status:', req.params.taskId, req.body.status);
    const { domain, username, projectId, taskId } = req.params;
    const { status } = req.body;
    try {
        const task = await taskService.changeTaskStatus(taskId, status);
        res.status(200).json(task);
    } catch (error) {
        if (error.message === 'Task not found') {
            res.status(404).json({ error: error.message });
        } else {
            console.error('Error changing task status:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

const assignTaskToUser = async (req, res) => {
    const { domain, username, projectId, taskId } = req.params;
    const { user } = req.body;
    console.log("User in assigned user: ", user);
    console.log("User in assignTaskToUser controller: ", user.username, user._id);

    try {
        const task = await taskService.assignTaskToUser(taskId, user._id);
        res.status(200).json(task);
    } catch (error) {
        if (error.message === 'Task not found' || error.message === 'User not found') {
            res.status(404).json({ error: error.message });
        } else {
            console.error('Error assigning task to user:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

module.exports = {
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    getProjectTasks,
    changeTaskStatus,
    assignTaskToUser
}