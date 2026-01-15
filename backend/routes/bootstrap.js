const express = require('express');
const router = express.Router();
const supabaseAdmin = require('../utils/supabaseAdmin');

router.post('/signup', async (req, res) => {
  const { userId, email, full_name, org_name } = req.body;

  if (!userId || !email || !org_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.getUserById(userId);

    if (authError || !authUser.user) {
      return res.status(401).json({ error: 'Invalid auth user' });
    }

    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({ name: org_name })
      .select()
      .single();

    if (orgError) throw orgError;

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email,
        full_name,
        role: 'user',
        organization_id: org.id
      })
      .select()
      .single();

    if (userError) throw userError;

    res.status(201).json({ user, organization: org });
  } catch (err) {
    console.error('Bootstrap signup failed:', err);
    res.status(500).json({ error: 'Signup bootstrap failed' });
  }
});

module.exports = router;
