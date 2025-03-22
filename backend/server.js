const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const shortid = require('shortid');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User'); // Adjust the path if needed
const Url = require('./models/Url');
const authMiddleware = require('./middleware/auth');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


//const Url = mongoose.model('Url', urlSchema);

// Routes

// Registration endpoint
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username, password: hashedPassword });
      
      await newUser.save();
      res.json({ message: 'User registered successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json('Server error');
    }
  });

// Login endpoint
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Find user by username
      const user = await User.findOne({ username });
      if (!user) return res.status(400).json('Invalid credentials');
  
      // Compare the provided password with the hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json('Invalid credentials');
  
      // Create and sign a JWT payload
      const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET, // Ensure you set this in your .env file
        { expiresIn: '1h' }
      );
  
      res.json({ token });
    } catch (err) {
      console.error(err);
      res.status(500).json('Server error');
    }
  });

app.post('/api/shorten', authMiddleware, async (req, res) => {
  const { originalUrl } = req.body;
  
  try {
    // Optionally, check if the URL already exists for the same user
    let url = await Url.findOne({ originalUrl, user: req.user.id });
    
    if (url) {
      return res.json(url);
    }
    
    const shortCode = shortid.generate();
    url = new Url({
      originalUrl,
      shortCode,
      user: req.user.id // Associate URL with the user
    });
    
    await url.save();
    res.json(url);
  } catch (err) {
    console.error(err);
    res.status(500).json('Server error');
  }
});

// Get all URLs (for admin dashboard)
app.get('/api/urls', authMiddleware, async (req, res) => {
  try {
    const urls = await Url.find({user: req.user.id}).sort({ createdAt: -1 });
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