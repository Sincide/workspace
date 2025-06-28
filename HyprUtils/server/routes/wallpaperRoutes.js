const express = require('express');
const multer = require('multer');
const router = express.Router();
const wallpaperService = require('../services/wallpaperService');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// GET /api/wallpapers - Get all wallpapers
router.get('/wallpapers', async (req, res) => {
  try {
    console.log('GET /api/wallpapers - Fetching all wallpapers');
    const wallpapers = await wallpaperService.getAllWallpapers();

    res.json({
      success: true,
      wallpapers: wallpapers
    });
  } catch (error) {
    console.error('Error in GET /api/wallpapers:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch wallpapers'
    });
  }
});

// POST /api/wallpapers - Upload new wallpaper
router.post('/wallpapers', upload.single('wallpaper'), async (req, res) => {
  try {
    console.log('POST /api/wallpapers - Uploading new wallpaper');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No wallpaper file provided'
      });
    }

    const wallpaper = await wallpaperService.saveWallpaper(req.file);

    res.json({
      success: true,
      message: 'Wallpaper uploaded successfully',
      wallpaper: wallpaper
    });
  } catch (error) {
    console.error('Error in POST /api/wallpapers:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload wallpaper'
    });
  }
});

// POST /api/wallpapers/set - Set active wallpaper
router.post('/wallpapers/set', async (req, res) => {
  try {
    const { wallpaperId } = req.body;
    console.log(`POST /api/wallpapers/set - Setting wallpaper ${wallpaperId} as active`);

    if (!wallpaperId) {
      return res.status(400).json({
        success: false,
        error: 'Wallpaper ID is required'
      });
    }

    const result = await wallpaperService.setActiveWallpaper(wallpaperId);

    res.json(result);
  } catch (error) {
    console.error('Error in POST /api/wallpapers/set:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to set wallpaper'
    });
  }
});

// DELETE /api/wallpapers/:id - Delete wallpaper
router.delete('/wallpapers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`DELETE /api/wallpapers/${id} - Deleting wallpaper`);

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Wallpaper ID is required'
      });
    }

    const result = await wallpaperService.deleteWallpaper(id);

    res.json(result);
  } catch (error) {
    console.error(`Error in DELETE /api/wallpapers/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete wallpaper'
    });
  }
});

// GET /api/wallpapers/:id/thumbnail - Get wallpaper thumbnail
router.get('/wallpapers/:id/thumbnail', async (req, res) => {
  try {
    const { id } = req.params;
    const thumbnail = await wallpaperService.getWallpaperThumbnail(id);
    
    res.set('Content-Type', thumbnail.contentType);
    res.send(thumbnail.data);
  } catch (error) {
    console.error(`Error in GET /api/wallpapers/${req.params.id}/thumbnail:`, error);
    res.status(404).json({
      success: false,
      error: error.message || 'Thumbnail not found'
    });
  }
});

module.exports = router;