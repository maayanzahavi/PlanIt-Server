
const organizationService = require('../services/organization');

const createOrganization = async (req, res) => {
    try {
      const result = await organizationService.createOrganization(req.body);
      res.status(201).json(result); 
    } catch (error) {
      console.error('Error in controller:', error);
      res.status(500).json({ error: error.message });
    }
  };

const getOrganizationById = async (req, res) => {
    try {
        const organization = await organizationService.getOrganizationById(req.params.id);
        res.status(200).json(organization);
    } catch (error) {
        if (error.message === 'Organization not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

const getOrganizationByDomain = async (req, res) => {
    const { domain } = req.params;
    try {
        const organization = await organizationService.getOrganizationByDomain(domain);
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }
        res.status(200).json(organization);
    } catch (error) {
        if (error.message === 'Organization not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

const updateOrganization = async (req, res) => {
    const { domain } = req.params;
    try {
        // Get organization by domain
        const organization = await organizationService.getOrganizationByDomain(domain);
        if (!organization) {
            return res.status(404).json({ error: 'Organization not found' });
        }

        const newOrganization = await organizationService.updateOrganization(req.params.id, req.body);
        res.status(200).json(newOrganization);
    } catch (error) {
        if (error.message === 'Organization not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}   

const deleteOrganization = async (req, res) => {
    const { domain } = req.params;

    try {
         // Get organization by domain
         const organization = await organizationService.getOrganizationByDomain(domain);
         if (!organization) {
             return res.status(404).json({ error: 'Organization not found' });
         }

        const newOrganization = await organizationService.deleteOrganization(req.params.id);
        res.status(200).json(newOrganization);
    } catch (error) {
        if (error.message === 'Organization not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

const getOrganizationByUsername = async (req, res) => {
    const { username } = req.params;
    console.log('Fetching organization by username in controller:', username);
    try {
        const organization = await organizationService.getOrganizationByUsername(username);
        if (!organization) {
            console.log('Organization not found in controller');
            return res.status(404).json({ error: 'Organization not found' });
        }
        res.status(200).json(organization);
    } catch (error) {
        if (error.message === 'Organization not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
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