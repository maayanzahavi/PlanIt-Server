const Organization = require('../models/organization');

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

const createOrganization = async (organization) => {
    const newOrganization = new Organization(organization);
    organization.domain = await generateUniqueDomain(organization.name);
    try {
        await newOrganization.save();
        return newOrganization;
    } catch (error) {
        throw new Error('Error creating organization: ' + error.message);
    }
}

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
    try {
        const organization = await Organization.findOne({ domain }).populate('users').populate('projects').populate('tasks').populate('notifications');
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

module.exports = {
    createOrganization,
    getOrganizationById,
    updateOrganization,
    deleteOrganization,
    getOrganizationByDomain
}