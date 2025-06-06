const userService = require('../services/user');
const organizationService = require('../services/organization');

const createTeamManager = async (req, res) => {
    try {
      const { domain } = req.params;
      const organization = await organizationService.getOrganizationByDomain(domain);
      if (!organization) {
        return res.status(404).json({ error: 'Organization not found' });
      }
  
      const creator = await userService.getUserByUsername(req.user.username);
      const creatorId = creator._id;
      const newManager = await userService.createTeamManager(req.body, organization._id, creatorId);
  
      console.log("Manager saved:", newManager);
      res.status(201).json(newManager);
    } catch (error) {
      console.error("Error creating team manager:", error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

const createTeamMember = async (req, res) => {
    const { domain, username } = req.params;

    try {
        // Get organization by domain
        const organization = await organizationService.getOrganizationByDomain(domain);
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        // Get manager by username
        const manager = await userService.getUserByUsername(username);
        if (!manager) {
            return res.status(404).json({ error: 'Manager not found' });
        }

        // Create team member
        const user = await userService.createTeamMember(req.body, organization._id, manager._id);
        res.status(201).json(user);
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

const createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        if (error.message === 'User not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

const getUserByUsername = async (req, res) => {
    console.log(`getUserByUsername called with username: ${req.params.username}`);

    try {
        const user = await userService.getUserByUsername(req.params.username);
        console.log('User found:', user.username);
        res.status(200).json(user);
    } catch (error) {
        if (error.message === 'User not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

const updateUser = async (req, res) => {
    const { username } = req.params;

    try {
        // Get manager by username
        const user = await userService.getUserByUsername(username);
        if (!user) {
            return res.status(404).json({ error: 'Manager not found' });
        }

        const newUser = await userService.updateUser(user._id, req.body);
        res.status(200).json(newUser);
    } catch (error) {
        if (error.message === 'User not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

const deleteUser = async (req, res) => {
    const { username } = req.params;
    
    try {
        const user = await userService.getUserByUsername(username);
        console.log('User found:', user.username);
        if (!user) {
            return res.status(404).json({ error: 'user not found' });
        }

        const newUser = await userService.deleteUser(user._id);
        res.status(200).json(newUser);
    } catch (error) {
        if (error.message === 'User not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};

const getTeamMembers = async (req, res) => {
    try {
        console.log(`getTeamMembers called with username: ${req.params.username}`);

        const teamMembers = await userService.getTeamMembers(req.params.username);
      res.json(teamMembers);
    } catch (error) {
      console.error("Error in getTeamMembers controller:", error);
      res.status(500).json({ message: error.message });
    }
  };

module.exports = {
    createTeamManager,
    createTeamMember,
    createUser,
    getUserById,
    getUserByUsername,
    updateUser,
    deleteUser,     
    getTeamMembers,
};