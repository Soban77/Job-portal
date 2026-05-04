const jwt = require('jsonwebtoken');
const User = require('../models/user');

function getTokenFromReq(req) {
  const auth = req.headers.authorization;
  if (!auth) return null;
  const [scheme, token] = auth.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

const protect = async (req, res, next) => {
  try {
    const token = getTokenFromReq(req);
    if (!token) return res.status(401).json({ error: 'Not authorized, no token' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ error: 'Not authorized, user not found' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Not authorized, token failed' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Not authorized' });
  if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Forbidden' });
  next();
};

module.exports = { protect, authorize };