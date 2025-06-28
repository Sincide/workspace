const { spawn } = require('child_process');
const CommandExecution = require('../models/CommandExecution');

class CommandService {
  // Execute a shell command
  async executeCommand(command) {
    return new Promise((resolve, reject) => {
      console.log(`Executing command: ${command}`);
      const startTime = Date.now();
      
      // Parse command and arguments
      const parts = command.trim().split(/\s+/);
      const cmd = parts[0];
      const args = parts.slice(1);
      
      let output = '';
      let errorOutput = '';
      
      // Spawn the process
      const child = spawn(cmd, args, {
        shell: true,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      // Collect stdout
      child.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      // Collect stderr
      child.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });
      
      // Handle process completion
      child.on('close', async (code) => {
        const executionTime = Date.now() - startTime;
        const finalOutput = output + (errorOutput ? '\n' + errorOutput : '');
        
        console.log(`Command completed with exit code: ${code}, execution time: ${executionTime}ms`);
        
        try {
          // Save to database
          const commandExecution = new CommandExecution({
            command: command.trim(),
            output: finalOutput,
            exitCode: code,
            executionTime: executionTime
          });
          
          const savedExecution = await commandExecution.save();
          console.log(`Command execution saved to database with ID: ${savedExecution._id}`);
          
          resolve({
            _id: savedExecution._id,
            command: command.trim(),
            output: finalOutput,
            exitCode: code,
            executionTime: executionTime,
            timestamp: savedExecution.timestamp
          });
        } catch (error) {
          console.error('Error saving command execution to database:', error);
          reject(error);
        }
      });
      
      // Handle process errors
      child.on('error', (error) => {
        console.error(`Command execution error: ${error.message}`);
        reject(new Error(`Failed to execute command: ${error.message}`));
      });
      
      // Set timeout for long-running commands (30 seconds)
      const timeout = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error('Command execution timed out after 30 seconds'));
      }, 30000);
      
      child.on('close', () => {
        clearTimeout(timeout);
      });
    });
  }
  
  // Get command history
  async getCommandHistory(limit = 50) {
    try {
      console.log(`Fetching command history (limit: ${limit})`);
      
      const history = await CommandExecution.find({})
        .sort({ timestamp: -1 })
        .limit(limit)
        .lean();
      
      console.log(`Retrieved ${history.length} command executions from history`);
      return history;
    } catch (error) {
      console.error('Error fetching command history:', error);
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
      
      console.log(`Retrieved command execution: ${execution.command}`);
      return execution;
    } catch (error) {
      console.error('Error fetching command execution:', error);
      throw error;
    }
  }
  
  // Clear command history
  async clearCommandHistory() {
    try {
      console.log('Clearing command history');
      
      const result = await CommandExecution.deleteMany({});
      
      console.log(`Cleared ${result.deletedCount} command executions from history`);
      return { deletedCount: result.deletedCount };
    } catch (error) {
      console.error('Error clearing command history:', error);
      throw error;
    }
  }
}

module.exports = new CommandService();