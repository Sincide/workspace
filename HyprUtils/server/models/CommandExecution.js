const mongoose = require('mongoose');

const commandExecutionSchema = new mongoose.Schema({
  command: {
    type: String,
    required: true,
    trim: true
  },
  output: {
    type: String,
    default: ''
  },
  exitCode: {
    type: Number,
    required: true
  },
  executionTime: {
    type: Number, // in milliseconds
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
commandExecutionSchema.index({ timestamp: -1 });
commandExecutionSchema.index({ command: 1 });

module.exports = mongoose.model('CommandExecution', commandExecutionSchema);