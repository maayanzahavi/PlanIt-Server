const userService = require('../services/user');
const Notification = require('../models/notification');
require('../models/user');

const createNotification = async (notificationData) => {
    console.log('Creating notification in service :', notificationData);
    try {
        const notification = new Notification(notificationData);
        await notification.save();
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw new Error('Error creating notification: ' + error.message);
    }
}

const getNotificationById = async (notificationId) => {
    console.log('Fetching notification by ID in service:', notificationId);
    try {
        const notification = await Notification.findById(notificationId)
            .populate('user')
            .populate('task')
            .populate('project');
        if (!notification) {
            throw new Error('Notification not found');
        }
        return notification;
    }
    catch (error) {
        console.error('Error fetching notification:', error);
        throw new Error('Error fetching notification: ' + error.message);
    }
}

const getNotificationsByUserId = async (userId) => {
    console.log('Fetching notifications for user ID in service:', userId);
    try {
        const notifications = await Notification.find({ user: userId })
            .populate('user')
            .populate('task')
            .populate('project');
        return notifications;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw new Error('Error fetching notifications: ' + error.message);
    }
}

const addNotificationToUser = async (userId, notificationId) => {
    console.log('Adding notification to user in service:', userId, notificationId);
    try {
        const user = await userService.getUserById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        user.notifications.push(notificationId);
        await user.save();
        return user;
    } catch (error) {
        console.error('Error adding notification to user:', error);
        throw new Error('Error adding notification to user: ' + error.message);
    }
}

const deleteNotification = async (notificationId) => {
    console.log('Deleting notification in service:', notificationId);
    try {
        // Find and delete the notification
        const notification = await Notification.findByIdAndDelete(notificationId);
        if (!notification) {
            throw new Error('Notification not found');
        }

        // Remove notification from user's notifications
        const user = await userService.getUserById(notification.user);
        if (!user) {
            throw new Error('User not found');
        }
        console.log('User before removing notification:', user);
        user.notifications = user.notifications.filter(
            (id) => id.toString() !== notificationId.toString()
        );
        await user.save();

        return notification;
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw new Error('Error deleting notification: ' + error.message);
    }
}

const handleNewNotification = async (userId, content) => {
    console.log('Handling new notification for user:', userId, 'with content:', content);
    // Create a notification for the task status change
    const notification = await createNotification({
        content: content,
        time: new Date(),
        user: userId
    });

    // Add notification to user
    await addNotificationToUser(
       userId, notification._id
    );
}

module.exports = {
    createNotification,
    getNotificationById,
    getNotificationsByUserId,
    addNotificationToUser,
    deleteNotification,
    handleNewNotification
};