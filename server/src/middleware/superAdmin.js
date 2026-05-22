const jwt = require('jsonwebtoken');

function superAdminOnly(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, error: 'Super Admin access required' });
    }
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

module.exports = { superAdminOnly };
