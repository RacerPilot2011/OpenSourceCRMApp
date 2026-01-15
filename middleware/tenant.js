function enforceTenant(req, res, next) {
  if (!req.user || !req.user.organization_id) {
    return res.status(403).json({ error: 'No organization' });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = { enforceTenant, requireAdmin };