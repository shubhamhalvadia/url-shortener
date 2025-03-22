const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Get token from the request header
  const token = req.headers['x-auth-token'];
  if (!token) return res.status(401).json('No token, authorization denied');

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded token payload to req.user
    next();
  } catch (err) {
    res.status(401).json('Token is not valid');
  }
};

module.exports = authMiddleware;