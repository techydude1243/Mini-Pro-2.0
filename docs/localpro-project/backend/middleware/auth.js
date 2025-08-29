// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
  // Get the token from the request header
  const token = req.header('x-auth-token');

  // 1. Check if there is no token
  if (!token) {
    // 401 Unauthorized
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // 2. If there is a token, verify it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. If verified, add the user from the payload to the request object
    req.user = decoded.user;

    // 4. Call the next middleware or route handler
    next();
  } catch (err) {
    // If the token is not valid
    res.status(401).json({ message: 'Token is not valid' });
  }
}

module.exports = auth;