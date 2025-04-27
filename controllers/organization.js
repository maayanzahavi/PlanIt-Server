
const organizationService = require('../services/organization');
const Organization = require('../models/organization');
const e = require('express');

const createOrganization = async (res, req) => {
    try {
        const organization = await organizationService.createOrganization(req.body);
        res.status(201).json(organization);
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

}

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

const updateOrganization = async (req, res) => {
    try {
        const organization = await organizationService.updateOrganization(req.params.id, req.body);
        res.status(200).json(organization);
    } catch (error) {
        if (error.message === 'Organization not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}   

const deleteOrganization = async (req, res) => {
    try {
        const organization = await organizationService.deleteOrganization(req.params.id);
        res.status(200).json(organization);
    } catch (error) {
        if (error.message === 'Organization not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

exports = {
    createOrganization,
    getOrganizationById,
    updateOrganization,
    deleteOrganization
}