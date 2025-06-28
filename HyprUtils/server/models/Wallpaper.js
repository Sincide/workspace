const mongoose = require('mongoose');

const wallpaperSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
    unique: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  thumbnailPath: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  dimensions: {
    width: Number,
    height: Number
  }
}, {
  timestamps: true
});

// Ensure only one wallpaper can be active at a time
wallpaperSchema.pre('save', async function(next) {
  if (this.isActive && this.isModified('isActive')) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

// Index for faster queries
wallpaperSchema.index({ isActive: 1 });
wallpaperSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Wallpaper', wallpaperSchema);