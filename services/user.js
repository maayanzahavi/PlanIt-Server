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


const { verifyResetToken } = require('./token');

async function isSigned(username, password) {
  console.log("Checking if user is signed in with username:", username);
  try {
    const user = await User.findOne({ username });
    if (!user) return false;
    console.log("User found:", user.username);
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
  
      const user = await newUser.save();
      console.log("Saved manager user:", user);
  
      // Add the new manager to the creator's team
      if (creatorId) {
        const result = await User.findByIdAndUpdate(
          creatorId,
          { $addToSet: { team: user._id } }, 
          { new: true }
        ).populate('team'); 
      } else {
        console.warn("No creatorId provided — team not updated.");
      }
  
      return user;
    } catch (error) {
      console.error("Error in createTeamManager service:", error);
      throw new Error('Error creating manager user: ' + error.message);
    }
  };
  
  const skill = require('./skill');


const createTeamMember = async (userData, organizationId, creatorId) => {
  try {
    //Create lists of tags by id
    const skillDocs = userData.skills.map(tag => tag._id);
    const preferenceDocs = userData.preferences.map(tag => tag._id);


    // Save the user with hashed password
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
      experience: userData.experience || 0,
      organization: organizationId,
      skills: skillDocs,
      preferences: preferenceDocs,
      tasks: [],
      notifications: [],
      manager: creatorId,
    });

    await newUser.save();
    console.log(" [createTeamMember] Saved user:", newUser);

    // Add the new user to the team of the creator
    if (creatorId) {
      const updatedManager = await User.findByIdAndUpdate(
        creatorId,
        { $addToSet: { team: newUser._id } },
        { new: true }
      ).populate('team');
      console.log("[createTeamMember] Updated manager with new team member:", updatedManager.username);
    } else {
      console.warn(" [createTeamMember] No creatorId provided – skipping manager team update.");
    }

    return newUser;
  } catch (err) {
    console.error(" [createTeamMember] Error occurred:", err.message);
    console.error(err.stack);
    throw new Error('Error creating team member: ' + err.message);
  }
};

const createOrganizationHead = async (userData) => 
{
  try {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = new User({
      email: userData.email,
      username: userData.username,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role || 'organization_head',
      password: hashedPassword,
      profilePic: userData.profilePic || '',
      experience: 0,
      organization: null
    });

    await user.validate();
    await user.save();
    
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('User creation failed: ' + error.message);
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
        const user = await User.findById(userId)
            .populate('organization')
            .populate('skills')
            .populate('preferences')
            .populate({
                path: 'projects',
                populate: [
                    { path: 'team' },
                    { path: 'manager' },
                    { path: 'tasks', populate: { path: 'tags' } }
                ]
            })
            .populate('team')
            .populate('manager')
            .populate({
                path: 'tasks',
                populate: [{
                    path: 'tags'
                }, {
                    path: 'assignedTo'
                }]
            })
            .populate('notifications')
            .populate('profilePic');
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
        const user = await User.findOne({ username })
            .populate('organization')
            .populate('skills')
            .populate('preferences')
            .populate({
                path: 'projects',
                populate: [
                    { path: 'team' },
                    { path: 'manager' },
                    { path: 'tasks', populate: { path: 'tags' } }
                ]
            })
           .populate({
              path: 'team',
              populate: {
                path: 'team',
                model: 'User'
              }
            }) 
            .populate('manager')
            .populate({
                path: 'tasks',
                populate: [{
                    path: 'tags'
                }, {
                    path: 'assignedTo'
                }]
            })
            .populate('notifications')
            .populate('profilePic');
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
        const updatedUser = await User.findByIdAndUpdate(userId, userData, { new: true })
            .populate('organization')
            .populate('skills')
            .populate('preferences')
            .populate({
                path: 'projects',
                populate: [
                    { path: 'team' },
                    { path: 'manager' },
                    { path: 'tasks', populate: { path: 'tags' } }
                ]
            })
            .populate('team')
            .populate('manager')
            .populate({
                path: 'tasks',
                populate: [{
                    path: 'tags'
                }, {
                    path: 'assignedTo'
                }]
            })
            .populate('notifications');
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
        // Reassign tasks to null
         await Task.updateMany({ assignedTo: userId }, { assignedTo: null });
       
        // Remove from manager's team
        await User.findByIdAndUpdate(user.manager, {
          $pull: { team: userId }
        });

        // Remove from projects
        await Project.updateMany({ team: userId }, { $pull: { team: userId } });
        break;

      case 'manager':
         //Delete all team members under this manager
        await User.deleteMany({ manager: userId });

        // Get all projects managed by this manager
        const projects = await Project.find({ manager: userId });

        //Delete all projects managed by this manager
        const projectService = require('./project');
        for (const project of projects) {
          await projectService.deleteProject(project._id);
        }

        // Delete from manager's team
        await User.findByIdAndUpdate(user.manager, {
          $pull: { team: userId }
        });


        break;

      default:
        throw new Error('Unknown user role');
    }

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

const addTasksToUser = async (userId, taskIds) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    user.tasks.push(...taskIds);
    await user.save();
    
    return user;
  } catch (error) {
    console.error('Error adding tasks to user:', error);
    throw new Error('Error adding tasks to user: ' + error.message);
  }
}

const addProjectToUser = async (userId, projectId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    user.projects.push(projectId);
    await user.save();
    
    return user;
  } catch (error) {
    console.error('Error adding project to user:', error);
    throw new Error('Error adding project to user: ' + error.message);
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

const checkAvailability = async (email , username) => {
  try {
    const userByEmail = await User.findOne({ email });
    const userByUsername = await User.findOne({ username });  
    console.log('Checking availability for email:', email, 'and username:', username);
    console.log('User found by email:', userByEmail ? userByEmail.email : 'none');
    console.log('User found by username:', userByUsername ? userByUsername.username : 'none');
    console.log('Email availability:', !!userByEmail);
    console.log('Username availability:', !!userByUsername);
    return {
      emailTaken: !!userByEmail,
      usernameTaken: !!userByUsername
    };    
  } catch (error) {
    console.error('Error checking availability:', error);
    throw new Error('Error checking availability: ' + error.message);
  }
};

const addTaskToUser = async (userId, taskId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    user.tasks.push(taskId);
    await user.save();
    
    return user;
  } catch (error) {
    console.error('Error adding task to user:', error);
    throw new Error('Error adding task to user: ' + error.message);
  }
}

const removeTaskFromUser = async (userId, taskId) => {
  console.log("Remove task from user: ", userId);
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.warn(`Assigned user ${userId} not found while removing task ${taskId}`);
      return;
    }

    user.tasks = user.tasks.filter(task => task.toString() !== taskId);
    await user.save();
    
    return user;
  } catch (error) {
    console.error('Error removing task from user:', error);
    throw new Error('Error removing task from user: ' + error.message);
  }
};


const resetPassword = async (token, password) => {
 try{
      const decoded = verifyResetToken(token);
      const hashed = await bcrypt.hash(password, 10);
      const updatedUser = await User.findByIdAndUpdate(decoded.id, { password: hashed }, { new: true })
        .populate('organization');
      return updatedUser;
 } catch (err) {
    console.error('Error resetting password:', err);
    throw new Error('Error resetting password: ' + err.message);

  }
}

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
    addTasksToUser,
    addProjectToUser,
    checkAvailability,
    createOrganizationHead,
    addTaskToUser,
    resetPassword
}