const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const shortid = require('shortid');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// URL Schema
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
  }
});

const Url = mongoose.model('Url', urlSchema);

// Routes
// Create a short URL
app.post('/api/shorten', async (req, res) => {
  const { originalUrl } = req.body;
  
  try {
    // Check if URL already exists in database
    let url = await Url.findOne({ originalUrl });
    
    if (url) {
      return res.json(url);
    }
    
    // Create new URL record
    const shortCode = shortid.generate();
    url = new Url({
      originalUrl,
      shortCode
    });
    
    await url.save();
    res.json(url);
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});

// Get all URLs (for admin dashboard)
app.get('/api/urls', async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });
    res.json(urls);
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});

// Redirect to original URL
app.get('/:shortCode', async (req, res) => {
  try {
    const url = await Url.findOne({ shortCode: req.params.shortCode });
    
    if (!url) {
      return res.status(404).json('URL not found');
    }
    
    // Increment click count
    url.clicks++;
    await url.save();
    
    res.redirect(url.originalUrl);
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));