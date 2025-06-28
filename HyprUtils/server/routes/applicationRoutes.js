const express = require('express');
const router = express.Router();
const applicationService = require('../services/applicationService');

// GET /api/applications - Get all applications
router.get('/applications', async (req, res) => {
  try {
    console.log('GET /api/applications - Fetching all applications');
    const applications = await applicationService.getAllApplications();
    
    res.json({
      success: true,
      applications: applications
    });
  } catch (error) {
    console.error('Error in GET /api/applications:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch applications'
    });
  }
});

// POST /api/applications/:id/launch - Launch application
router.post('/applications/:id/launch', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`POST /api/applications/${id}/launch - Launching application`);
    
    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Application ID is required'
      });
    }
    
    const result = await applicationService.launchApplication(id);
    
    res.json(result);
  } catch (error) {
    console.error(`Error in POST /api/applications/${req.params.id}/launch:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to launch application'
    });
  }
});

module.exports = router;