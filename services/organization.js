const Organization = require('../models/organization');
const userService = require('../services/user');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const generateUniqueDomain = async (organizationName) => {
    let baseDomain = organizationName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let domain = baseDomain;
    let counter = 1;
  
    // Check if the domain already exists
    while (await Organization.exists({ domain })) {
      domain = `${baseDomain}-${counter}`;
      counter++;
    }
  
    return domain;
  };


  const key = "8c12f97e-59b9-4f91-8c3b-441e2a0b7c2a";

  const createOrganization = async (organizationData) => {
    try {
      const domain = await generateUniqueDomain(organizationData.organizationName);
      const hashedPassword = await bcrypt.hash(organizationData.organizationPassword, 10);
  
      const headUser = new User({
        email: organizationData.organizationEmail,
        username: organizationData.organizationUsername,
        firstName: organizationData.headFirstName,
        lastName: organizationData.headLastName,
        role: 'organization_head',
        password: hashedPassword,
        profilePic: organizationData.profilePic ?? "",
        experience: 0,
        organization: null 
      });
  
      await headUser.validate(); // this checks everything before save
  
      const organization = new Organization({
        name: organizationData.organizationName,
        domain,
        head: headUser._id
      });
  
      await organization.save();
      headUser.organization = organization._id;
      await headUser.save();
  
      // Create token
      const token = jwt.sign({ username: headUser.username }, key, { expiresIn: '7d' });
  
      return {
        token,
        user: {
          username: headUser.username,
          role: headUser.role
        },
        organization: {
          domain: organization.domain
        }
      };
  
    } catch (error) {
      console.error('Error creating organization:', error);
      throw new Error('Error creating organization: ' + error.message);
    }
  };
const getOrganizationById = async (organizationId) => {
    try {
        const organization = await Organization.findById(organizationId).populate('users').populate('projects').populate('tasks').populate('notifications');
        if (!organization) {
            throw new Error('Organization not found');
        }
        return organization;
    } catch (error) {
        throw new Error('Error fetching organization: ' + error.message);
    }
}

const getOrganizationByDomain = async (domain) => {
    console.log('Fetching organization by domain in service:', domain);
    try {
        const organization = await Organization.findOne({ domain });
        if (!organization) {
            throw new Error('Organization not found');
        }
        return organization;
    } catch (error) {
        throw new Error('Error fetching organization: ' + error.message);
    }
}

const updateOrganization = async (organizationId, organizationData) => {
    try {
        const updatedOrganization = await Organization.findByIdAndUpdate(organizationId, organizationData, { new: true }).populate('users').populate('projects').populate('tasks').populate('notifications');
        if (!updatedOrganization) {     
            throw new Error('Organization not found');
        }
        return updatedOrganization;
    }
    catch (error) {
        throw new Error('Error updating organization: ' + error.message);
    }
}

const deleteOrganization = async (organizationId) => {
    try {
        const deletedOrganization = await Organization.findByIdAndDelete(organizationId);
        if (!deletedOrganization) {
            throw new Error('Organization not found');
        }
        return deletedOrganization;
    } catch (error) {
        throw new Error('Error deleting organization: ' + error.message);
    }
}

const getOrganizationByUsername = async (username) => {
    console.log('Fetching organization by username in service:', username);
    try {
        const user = await userService.getUserByUsername(username);
        if (!user) {
            console.log('User not found');
            throw new Error('User not found');
        }

        if (!user.organization) {
            console.log('Organization not found');
            throw new Error('Organization not found');
        }
        console.log('User organization:', user.organization);
        return user.organization;
    }
    catch (error) {
        throw new Error('Error fetching organization: ' + error.message);
    }
}

module.exports = {
    createOrganization,
    getOrganizationById,
    updateOrganization,
    deleteOrganization,
    getOrganizationByDomain,
    getOrganizationByUsername
}