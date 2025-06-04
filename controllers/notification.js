const projectService = require('../services/project');

const sendAssignmentsNotification = async (req, res) => {
    console.log('Sending assignments notification for project:', req.params.projectId);
    try {
        const projectId = req.params.projectId;

        // Notify all team members about the new assignments
        const notifications = await projectService.sendAssignmentsNotification(projectId);
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error sending assignments notification:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    sendAssignmentsNotification
};