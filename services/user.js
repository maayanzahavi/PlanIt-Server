require('../models/task');
require('../models/skill');
require('../models/organization');
require('../models/project');
require('../models/notification');
const crypto = require('crypto');
const User = require('../models/user');
const Task = require('../models/task');
const Project = require('../models/project');
const bcrypt = require('bcrypt');


async function isSigned(username, password) {
  console.log("Checking if user is signed in with username:", username);
  try {
    const user = await User.findOne({ username });
    if (!user) return false;
    console.log("User found:", user);
    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", passwordMatch);
    return passwordMatch;
  } catch (error) {
    console.error("Error in isSigned:", error);
    return false;
  }
}

  const createTeamManager = async (userData, organizationId, creatorId) => {
    try {
      console.log("Creating team manager with data:", userData);
      const rawPassword = userData.password && userData.password.trim() !== "" 
      ? userData.password 
      : "As1234";
    
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    
  
      const newUser = new User({
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: hashedPassword,
        role: 'manager',
        profilePic: userData.profilePic ?? "",
        experience: 0,
        organization: organizationId,
        skills: [],
        projects: [],
        tasks: [],
        notifications: [],
        preferences: [],
        manager: creatorId,
      });
  
      await newUser.save();
      console.log("Saved manager user:", newUser);
  
      if (creatorId) {
        const result = await User.findByIdAndUpdate(
          creatorId,
          { $addToSet: { team: newUser._id } }, 
          { new: true }
        ).populate('team'); 
      } else {
        console.warn("No creatorId provided — team not updated.");
      }
  
      return newUser;
    } catch (error) {
      console.error("Error in createTeamManager service:", error);
      throw new Error('Error creating manager user: ' + error.message);
    }
  };
  
const createTeamMember = async (userData, organizationId, creatorId) => {
    try {
      console.log("Creating team member with data:", userData);
      const rawPassword = userData.password && userData.password.trim() !== "" 
      ? userData.password 
      : "As1234";
    
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    

      const newUser = new User({
        email: userData.email,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: hashedPassword,
        role: 'team_member',
        profilePic: userData.profilePic ?? "",
        experience: 0,
        organization: organizationId,
        skills: [],
        projects: [],
        tasks: [],
        notifications: [],
        preferences: [],
        manager: creatorId,
      });

      await newUser.save();
      console.log("Saved team member user:", newUser);

      if (creatorId) {
        const result = await User.findByIdAndUpdate(
          creatorId,
          { $addToSet: { team: newUser._id } }, 
          { new: true }
        ).populate('team'); 
      } else {
        console.warn("No creatorId provided — team not updated.");
      }

      return newUser;
    } catch (error) {
      console.error("Error in createTeamManager service:", error);
      throw new Error('Error creating manager user: ' + error.message);
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
        const user = await User.findById(userId).populate('organization').populate('skills').populate('preferences').populate('projects').populate('team').populate('manager').populate('tasks').populate('notifications').populate('profilePic');
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
        const user = await User.findOne({ username }).populate('organization').populate('skills').populate('preferences').populate('projects').populate('team').populate('manager').populate('tasks').populate('notifications').populate('profilePic');
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
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    switch (user.role) {
      case 'team_member':
        // Reassign tasks to manager if exists, otherwise set to null
        if (user.manager) {
          await Task.updateMany({ assignedTo: userId }, { assignedTo: user.manager });
        } else {
          await Task.updateMany({ assignedTo: userId }, { assignedTo: null });
        }

        // Remove from manager's team
        await User.updateMany({ team: userId }, { $pull: { team: userId } });

        break;

      case 'manager':
        // Optional: reassign team members to the organization head or mark them unassigned
        await User.updateMany({ manager: userId }, { $set: { manager: null } });

        // Optionally handle projects under this manager
        await Project.updateMany({ manager: userId }, { $set: { manager: null } });

        break;

    //   case 'organization_head':
    //     // Delete the organization
    //     await Organization.findOneAndDelete({ head: userId });

    //     // Optionally cascade deletion or reassignment of managers/users
    //     await User.updateMany({ organization: user.organization }, { $set: { organization: null } });


    //     await Project.updateMany({ organization: user.organization }, { $set: { organization: null } });

    //     break;

      default:
        throw new Error('Unknown user role');
    }

    // Remove user from projects
    await Project.updateMany({ team: userId }, { $pull: { team: userId } });

    // Delete the user
    await User.findByIdAndDelete(userId);

    return { message: 'User deleted successfully' };

  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Error deleting user: ' + error.message);
  }
}


const removeProjectFromUsers = async (projectId) => {
    try {
        const users = await User.find({ projects: projectId });
        for (const user of users) {
            user.projects = user.projects.filter(project => project.toString() !== projectId);
            await user.save();
        }
    } catch (error) {
        throw new Error('Error removing project from users: ' + error.message);
    }
}
const removeTaskFromUser = async (taskId) => {
    try {
        const users = await User.find({ tasks: taskId });
        for (const user of users) {
            user.tasks = user.tasks.filter(task => task.toString() !== taskId);
            await user.save();
        }
    } catch (error) {
        throw new Error('Error removing task from users: ' + error.message);
    }
}

const getTeamMembers = async (username) => {
  try {
    const manager = await User.findOne({ username });
    if (!manager) throw new Error('Manager not found');

    const teamMembers = await User.find({ manager: manager._id });
    return teamMembers;
  } catch (error) {
    console.error("Error fetching team members:", error);
    throw error;
  }
};



module.exports = {
    isSigned,
    createTeamManager,
    createTeamMember,
    createUser,
    getUserById,
    getUserByUsername,
    updateUser,
    deleteUser,
    removeProjectFromUsers,
    removeTaskFromUser,
    getTeamMembers,
}