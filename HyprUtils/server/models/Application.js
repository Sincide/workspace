const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  command: {
    type: String,
    required: true
  },
  categories: [{
    type: String
  }],
  desktopFile: {
    type: String,
    required: true,
    unique: true
  },
  isRecent: {
    type: Boolean,
    default: false
  },
  lastLaunched: {
    type: Date,
    default: null
  },
  launchCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster searches
applicationSchema.index({ name: 'text', description: 'text' });
applicationSchema.index({ lastLaunched: -1 });

module.exports = mongoose.model('Application', applicationSchema);