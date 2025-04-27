import Organization from '../models/organization.js';

const createOrganization = async (organization) => {
    const newOrganization = new Organization(organization);
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

export {
    createOrganization,
    getOrganizationById,
    updateOrganization,
    deleteOrganization
}