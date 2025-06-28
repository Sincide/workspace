import api from './api';

// Description: Get a list of all installed applications
// Endpoint: GET /api/applications
// Request: {}
// Response: { success: boolean, applications: Array<{ _id: string, name: string, description: string, icon: string, command: string, categories: string[], isRecent: boolean }> }
export const getApplications = async () => {
  try {
    const response = await api.get('/api/applications');
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Launch an application by ID
// Endpoint: POST /api/applications/:id/launch
// Request: { applicationId: string }
// Response: { success: boolean, message: string, processId?: number }
export const launchApplication = async (applicationId: string) => {
  try {
    const response = await api.post(`/api/applications/${applicationId}/launch`);
    return response.data;
  } catch (error) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}