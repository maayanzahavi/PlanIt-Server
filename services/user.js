const User = require('../models/user');
const Task = require('../models/task');


const createTeamManager = async (user, organizationId) => {
    const newUser = new User(user);
    newUser.organization = organizationId;
    try {
        await newUser.save();
        return newUser;
    } catch (error) {
        throw new Error('Error creating user: ' + error.message);
    }
}

const createTeamMember = async (user, organizationId, managerId) => {
    const newUser = new User(user);
    newUser.organization = organizationId;
    newUser.manager = managerId;
    try {
        await newUser.save();
        return newUser;
    } catch (error) {
        throw new Error('Error creating user: ' + error.message);
    }
}

const createUser = async (user) => {
    const newUser = new User(user);
    try {
        await newUser.save();
        return newUser;
    } catch (error) {
        throw new Error('Error creating user: ' + error.message);
    }
}

const getUserById = async (userId) => {
    try {
        const user = await User.findById(userId).populate('organization').populate('skills').populate('preferences').populate('projects').populate('team').populate('manager').populate('tasks').populate('notifications');
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (error) {
        throw new Error('Error fetching user: ' + error.message);
    }
}

const getUserByUsername = async (username) => {
    console.log('Fetching user by username:', username);
    try {
        const user = await User.findOne({ username }).populate('organization').populate('skills').populate('preferences').populate('projects').populate('team').populate('manager').populate('tasks').populate('notifications');
        if (!user) {
            console.log('User not found');
            throw new Error('User not found');
        }
        return user;
    }
    catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Error fetching user: ' + error.message);
    }
}

const updateUser = async (userId, userData) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(userId, userData, { new: true }).populate('organization').populate('skills').populate('preferences').populate('projects').populate('team').populate('manager').populate('tasks').populate('notifications');
        if (!updatedUser) {     
            throw new Error('User not found');
        }
        return updatedUser;
    }
    catch (error) {
        throw new Error('Error updating user: ' + error.message);
    }
}

const deleteUser = async (userId) => {
    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            throw new Error('User not found');
        }
        return deletedUser;
    } catch (error) {
        throw new Error('Error deleting user: ' + error.message);
    }
}

module.exports = {
    createTeamManager,
    createTeamMember,
    createUser,
    getUserById,
    getUserByUsername,
    updateUser,
    deleteUser
}