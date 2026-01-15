const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const { enforceTenant, requireAdmin } = require('../middleware/tenant');

router.get('/', enforceTenant, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', req.user.organization_id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

router.post('/', async (req, res) => {
  console.log('==========================================');
  console.log('POST /organizations called');
  console.log('Request body:', req.body);
  console.log('Auth user:', req.user);
  console.log('==========================================');

  try {
    const { name } = req.body;

    if (!name) {
      console.error('❌ No organization name provided');
      return res.status(400).json({ error: 'Name is required' });
    }

    console.log('✓ Organization name provided:', name);

    // Check if user already has organization
    console.log('Checking if user already has organization...');
    const { data: existingUser, error: existingError } = await supabase
      .from('users')
      .select('id, organization_id')
      .eq('id', req.user.id)
      .single();

    if (existingError) {
      console.error('❌ Error checking user:', existingError);
      throw existingError;
    }

    console.log('User data:', existingUser);

    if (existingUser && existingUser.organization_id) {
      console.log('⚠️ User already has an organization:', existingUser.organization_id);
      return res.status(400).json({ error: 'User already has an organization' });
    }

    console.log('Creating new organization...');
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({ name })
      .select()
      .single();

    if (orgError) {
      console.error('❌ Error creating organization:', orgError);
      throw orgError;
    }

    console.log('✅ Organization created:', org);

    console.log('Linking organization to user...');
    const { data: updatedUser, error: userError } = await supabase
      .from('users')
      .update({ 
        organization_id: org.id,
        role: 'admin'
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (userError) {
      console.error('❌ Error updating user:', userError);
      throw userError;
    }

    console.log('✅ User updated with organization:', updatedUser);
    res.status(201).json(org);
  } catch (error) {
    console.error('❌ POST /organizations error:', error);
    res.status(500).json({ error: error.message || 'Failed to create organization' });
  }
});

router.put('/', enforceTenant, requireAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const { data, error } = await supabase
      .from('organizations')
      .update({ name })
      .eq('id', req.user.organization_id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

module.exports = router;