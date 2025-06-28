const express = require('express');
const router = express.Router();
const commandService = require('../services/commandService');

// POST /api/commands/execute - Execute a command
router.post('/commands/execute', async (req, res) => {
  try {
    const { command } = req.body;
    console.log(`POST /api/commands/execute - Executing command: ${command}`);

    if (!command || !command.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Command is required'
      });
    }

    const result = await commandService.executeCommand(command.trim());

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error in POST /api/commands/execute:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to execute command'
    });
  }
});

// GET /api/commands/history - Get command history
router.get('/commands/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    console.log(`GET /api/commands/history - Fetching history (limit: ${limit})`);

    const result = await commandService.getCommandHistory(limit);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error in GET /api/commands/history:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch command history'
    });
  }
});

// GET /api/commands/:id - Get specific command execution
router.get('/commands/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`GET /api/commands/${id} - Fetching command execution`);

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Command execution ID is required'
      });
    }

    const execution = await commandService.getCommandExecutionById(id);

    res.json({
      success: true,
      execution: execution
    });
  } catch (error) {
    console.error(`Error in GET /api/commands/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch command execution'
    });
  }
});

// DELETE /api/commands/history - Clear command history
router.delete('/commands/history', async (req, res) => {
  try {
    console.log('DELETE /api/commands/history - Clearing command history');

    const result = await commandService.clearCommandHistory();

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error in DELETE /api/commands/history:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to clear command history'
    });
  }
});

module.exports = router;