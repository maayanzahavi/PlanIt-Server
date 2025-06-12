const projectService = require('../services/project');
const notificationService = require('../services/notification');

const sendAssignmentsNotification = async (req, res) => {
    console.log('Sending assignments notification for project:', req.params.projectId);
    try {
        const projectId = req.params.projectId;
        const initialAssignments = req.body.initialAssignments || [];

        // Notify all team members about the new assignments
        const notifications = await projectService.sendAssignmentsNotification(projectId, initialAssignments);
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error sending assignments notification:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const deleteNotification = async (req, res) => {
    console.log('Deleting notification with ID:', req.params.notificationId);
    const notificationId = req.params.notificationId;
    try {
        // Delete the notification
        const deletedNotification = await notificationService.deleteNotification(notificationId);
        res.status(200).json(deletedNotification);
    } catch (error) {
        console.error('Error deleting notification:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = {
    sendAssignmentsNotification,
    deleteNotification
};