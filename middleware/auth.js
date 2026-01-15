const supabase = require('../utils/supabase');

async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Try to get user data from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, organization_id, role, email, full_name')
      .eq('id', user.id)
      .single();

    // If user doesn't exist in database, set basic info from auth
    if (userError || !userData) {
      req.user = {
        id: user.id,
        email: user.email,
        organization_id: null,
        role: 'user',
        full_name: null
      };
    } else {
      req.user = userData;
    }

    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

module.exports = { authenticateToken };