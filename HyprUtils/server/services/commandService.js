const { spawn } = require('child_process');
const CommandExecution = require('../models/CommandExecution');

class CommandService {
  // Execute a shell command
  async executeCommand(command) {
    return new Promise(async (resolve, reject) => {
      const startTime = Date.now();
      
      try {
        console.log(`Executing command: ${command}`);

        // Use fish shell if available, otherwise fall back to sh
        const shell = process.env.SHELL || '/bin/sh';
        const child = spawn(shell, ['-c', command], {
          stdio: 'pipe',
          env: process.env
        });

        let stdout = '';
        let stderr = '';

        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('close', async (code) => {
          const endTime = Date.now();
          const executionTime = endTime - startTime;
          const output = stdout + (stderr ? '\n' + stderr : '');

          try {
            // Save execution to database
            const execution = new CommandExecution({
              command,
              output,
              exitCode: code || 0,
              executionTime,
              timestamp: new Date(startTime)
            });

            await execution.save();
            console.log(`Command executed successfully with exit code: ${code || 0}`);

            resolve({
              _id: execution._id,
              command,
              output,
              exitCode: code || 0,
              executionTime,
              timestamp: execution.timestamp
            });
          } catch (dbError) {
            console.error('Error saving command execution:', dbError);
            // Still resolve with the execution result even if DB save fails
            resolve({
              command,
              output,
              exitCode: code || 0,
              executionTime,
              timestamp: new Date(startTime)
            });
          }
        });

        child.on('error', (error) => {
          console.error('Error executing command:', error);
          reject(new Error(`Failed to execute command: ${error.message}`));
        });

      } catch (error) {
        console.error('Error in executeCommand:', error);
        reject(error);
      }
    });
  }

  // Get command history
  async getCommandHistory(limit = 50) {
    try {
      console.log(`Fetching command history (limit: ${limit})`);

      const executions = await CommandExecution.find({})
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();

      // Extract unique commands for history dropdown
      const uniqueCommands = [...new Set(executions.map(exec => exec.command))];

      console.log(`Retrieved ${executions.length} command executions from history`);

      return {
        history: uniqueCommands,
        executions: executions
      };
    } catch (error) {
      console.error('Error getting command history:', error);
      throw error;
    }
  }

  // Get specific command execution by ID
  async getCommandExecutionById(id) {
    try {
      console.log(`Fetching command execution with ID: ${id}`);

      const execution = await CommandExecution.findById(id).lean();
      if (!execution) {
        throw new Error('Command execution not found');
      }

      return execution;
    } catch (error) {
      console.error('Error getting command execution:', error);
      throw error;
    }
  }

  // Clear command history
  async clearCommandHistory() {
    try {
      console.log('Clearing command history');

      const result = await CommandExecution.deleteMany({});
      console.log(`Deleted ${result.deletedCount} command executions`);

      return {
        message: 'Command history cleared successfully',
        deletedCount: result.deletedCount
      };
    } catch (error) {
      console.error('Error clearing command history:', error);
      throw error;
    }
  }
}

module.exports = new CommandService();