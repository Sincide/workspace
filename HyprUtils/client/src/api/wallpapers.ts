import api from './api';

// Description: Get a list of available wallpapers
// Endpoint: GET /api/wallpapers
// Request: {}
// Response: { wallpapers: Array<{ _id: string, filename: string, path: string, thumbnail: string, isActive: boolean }> }
export const getWallpapers = async () => {
  try {
    const response = await api.get('/api/wallpapers');
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Set a wallpaper as active
// Endpoint: POST /api/wallpapers/set
// Request: { wallpaperId: string }
// Response: { success: boolean, message: string }
export const setWallpaper = async (wallpaperId: string) => {
  try {
    const response = await api.post('/api/wallpapers/set', { wallpaperId });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Upload a new wallpaper
// Endpoint: POST /api/wallpapers
// Request: FormData with 'wallpaper' file
// Response: { success: boolean, message: string, wallpaper: object }
export const uploadWallpaper = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('wallpaper', file);
    
    const response = await api.post('/api/wallpapers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}

// Description: Delete a wallpaper
// Endpoint: DELETE /api/wallpapers/:id
// Request: {}
// Response: { success: boolean, message: string }
export const deleteWallpaper = async (wallpaperId: string) => {
  try {
    const response = await api.delete(`/api/wallpapers/${wallpaperId}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message);
  }
}