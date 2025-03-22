const mongoose = require('mongoose');
const shortid = require('shortid');

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true
  },
  shortCode: {
    type: String,
    required: true,
    default: shortid.generate
  },
  clicks: {
    type: Number,
    required: true,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  // Associate the URL with a user (if available)
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }
});

module.exports = mongoose.model('Url', urlSchema);