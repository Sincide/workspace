import api from './api';

// Description: Execute a shell command
// Endpoint: POST /api/commands/execute
// Request: { command: string }
// Response: { success: boolean, _id: string, command: string, output: string, exitCode: number, executionTime: number, timestamp: string }
export const executeCommand = async (command: string) => {
  try {
    const response = await api.post('/api/commands/execute', { command });
    return {
      output: response.data.output,
      exitCode: response.data.exitCode,
      timestamp: response.data.timestamp,
      _id: response.data._id,
      executionTime: response.data.executionTime
    };
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Get command history
// Endpoint: GET /api/commands/history
// Request: {}
// Response: { success: boolean, history: string[], executions: Array<{ _id: string, command: string, output: string, exitCode: number, timestamp: string, executionTime: number }> }
export const getCommandHistory = async () => {
  try {
    const response = await api.get('/api/commands/history');
    return {
      history: response.data.history,
      executions: response.data.executions
    };
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Get specific command execution details
// Endpoint: GET /api/commands/:id
// Request: {}
// Response: { success: boolean, execution: { _id: string, command: string, output: string, exitCode: number, timestamp: string, executionTime: number } }
export const getCommandExecutionById = async (id: string) => {
  try {
    const response = await api.get(`/api/commands/${id}`);
    return response.data.execution;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Clear command history
// Endpoint: DELETE /api/commands/history
// Request: {}
// Response: { success: boolean, message: string, deletedCount: number }
export const clearCommandHistory = async () => {
  try {
    const response = await api.delete('/api/commands/history');
    return {
      success: response.data.success,
      message: response.data.message,
      deletedCount: response.data.deletedCount
    };
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}