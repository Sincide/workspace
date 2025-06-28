const fs = require('fs').promises;
const path = require('path');
const sharp = require('sharp');
const { spawn } = require('child_process');
const { promisify } = require('util');
const Wallpaper = require('../models/Wallpaper');

class WallpaperService {
  constructor() {
    this.wallpaperDir = process.env.WALLPAPER_DIR || path.join(process.env.HOME || '/home/' + process.env.USER, 'Pictures/wallpapers');
    this.thumbnailDir = path.join(this.wallpaperDir, '.thumbnails');
    this.ensureDirectories();
  }

  // Ensure wallpaper and thumbnail directories exist
  async ensureDirectories() {
    try {
      await fs.mkdir(this.wallpaperDir, { recursive: true });
      await fs.mkdir(this.thumbnailDir, { recursive: true });
      console.log(`Wallpaper directories ensured: ${this.wallpaperDir}`);
    } catch (error) {
      console.error('Error creating wallpaper directories:', error);
    }
  }

  // Get all wallpapers from database
  async getAllWallpapers() {
    try {
      console.log('Fetching all wallpapers from database...');
      const wallpapers = await Wallpaper.find({}).sort({ createdAt: -1 });
      
      // Generate thumbnail URLs for frontend
      const wallpapersWithUrls = wallpapers.map(wallpaper => ({
        ...wallpaper.toObject(),
        thumbnail: `/api/wallpapers/${wallpaper._id}/thumbnail`
      }));

      console.log(`Retrieved ${wallpapers.length} wallpapers from database`);
      return wallpapersWithUrls;
    } catch (error) {
      console.error('Error getting wallpapers:', error);
      throw error;
    }
  }

  // Save uploaded wallpaper
  async saveWallpaper(file) {
    try {
      console.log(`Processing uploaded wallpaper: ${file.originalname}`);
      
      // Generate unique filename
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      const filename = `wallpaper_${timestamp}${ext}`;
      const wallpaperPath = path.join(this.wallpaperDir, filename);
      const thumbnailPath = path.join(this.thumbnailDir, `thumb_${filename}`);

      // Save original file
      await fs.writeFile(wallpaperPath, file.buffer);
      console.log(`Wallpaper saved to: ${wallpaperPath}`);

      // Get image dimensions
      const metadata = await sharp(file.buffer).metadata();
      
      // Generate thumbnail
      await sharp(file.buffer)
        .resize(400, 225, { 
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
      
      console.log(`Thumbnail generated: ${thumbnailPath}`);

      // Save to database
      const wallpaper = new Wallpaper({
        filename,
        originalName: file.originalname,
        path: wallpaperPath,
        thumbnailPath,
        mimeType: file.mimetype,
        size: file.size,
        dimensions: {
          width: metadata.width,
          height: metadata.height
        }
      });

      await wallpaper.save();
      console.log(`Wallpaper metadata saved to database with ID: ${wallpaper._id}`);

      return {
        ...wallpaper.toObject(),
        thumbnail: `/api/wallpapers/${wallpaper._id}/thumbnail`
      };
    } catch (error) {
      console.error('Error saving wallpaper:', error);
      throw error;
    }
  }

  // Set wallpaper as active
  async setActiveWallpaper(wallpaperId) {
    try {
      console.log(`Setting wallpaper ${wallpaperId} as active`);
      
      const wallpaper = await Wallpaper.findById(wallpaperId);
      if (!wallpaper) {
        throw new Error('Wallpaper not found');
      }

      // Update database - set all others to inactive and this one to active
      await Wallpaper.updateMany({}, { isActive: false });
      await Wallpaper.findByIdAndUpdate(wallpaperId, { isActive: true });

      // Set wallpaper using swww (Hyprland wallpaper setter)
      await this.setSystemWallpaper(wallpaper.path);
      
      console.log(`Successfully set ${wallpaper.filename} as active wallpaper`);
      return { success: true, message: 'Wallpaper set successfully' };
    } catch (error) {
      console.error('Error setting active wallpaper:', error);
      throw error;
    }
  }

  // Set system wallpaper using swww
  async setSystemWallpaper(wallpaperPath) {
    return new Promise((resolve, reject) => {
      console.log(`Setting system wallpaper: ${wallpaperPath}`);
      
      const swww = spawn('swww', ['img', wallpaperPath], {
        stdio: 'pipe'
      });

      let stderr = '';
      
      swww.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      swww.on('close', (code) => {
        if (code === 0) {
          console.log('System wallpaper set successfully');
          resolve();
        } else {
          console.error(`swww failed with code ${code}: ${stderr}`);
          // Don't reject here as the database update should still succeed
          // even if system wallpaper setting fails
          resolve();
        }
      });

      swww.on('error', (error) => {
        console.error('Error executing swww:', error.message);
        // Don't reject here as the database update should still succeed
        resolve();
      });
    });
  }

  // Delete wallpaper
  async deleteWallpaper(wallpaperId) {
    try {
      console.log(`Deleting wallpaper ${wallpaperId}`);
      
      const wallpaper = await Wallpaper.findById(wallpaperId);
      if (!wallpaper) {
        throw new Error('Wallpaper not found');
      }

      // Don't allow deleting active wallpaper
      if (wallpaper.isActive) {
        throw new Error('Cannot delete active wallpaper. Set another wallpaper as active first.');
      }

      // Delete files
      try {
        await fs.unlink(wallpaper.path);
        console.log(`Deleted wallpaper file: ${wallpaper.path}`);
      } catch (error) {
        console.warn(`Could not delete wallpaper file: ${error.message}`);
      }

      try {
        await fs.unlink(wallpaper.thumbnailPath);
        console.log(`Deleted thumbnail file: ${wallpaper.thumbnailPath}`);
      } catch (error) {
        console.warn(`Could not delete thumbnail file: ${error.message}`);
      }

      // Delete from database
      await Wallpaper.findByIdAndDelete(wallpaperId);
      console.log(`Wallpaper ${wallpaper.filename} deleted successfully`);

      return { success: true, message: 'Wallpaper deleted successfully' };
    } catch (error) {
      console.error('Error deleting wallpaper:', error);
      throw error;
    }
  }

  // Get wallpaper thumbnail
  async getWallpaperThumbnail(wallpaperId) {
    try {
      const wallpaper = await Wallpaper.findById(wallpaperId);
      if (!wallpaper) {
        throw new Error('Wallpaper not found');
      }

      const thumbnailData = await fs.readFile(wallpaper.thumbnailPath);
      return {
        data: thumbnailData,
        contentType: 'image/jpeg'
      };
    } catch (error) {
      console.error('Error getting wallpaper thumbnail:', error);
      throw error;
    }
  }
}

module.exports = new WallpaperService();