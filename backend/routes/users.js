const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const { enforceTenant, requireAdmin } = require('../middleware/tenant');

router.get('/', enforceTenant, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, created_at')
      .eq('organization_id', req.user.organization_id);

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/me', async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, organization_id, created_at')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
        const orgName = req.user.email.split('@')[0] + "'s Org";
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert({ name: orgName })
            .select()
            .single();

        if (orgError) throw orgError;

        const insertData = {
            id: req.user.id,
            email: req.user.email,
            full_name: req.user.email.split('@')[0],
            role: 'user',
            organization_id: org.id
        };

        const { data: createdUser, error: insertError } = await supabase
            .from('users')
            .insert(insertData)
            .select()
            .single();

        if (insertError) throw insertError;

        return res.json(createdUser);
        }

    res.json(user);

  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

router.post('/', async (req, res) => {
  console.log('==========================================');
  console.log('POST /users called');
  console.log('Request body:', req.body);
  console.log('Auth user from token:', req.user);
  console.log('==========================================');

  try {
    const { email, full_name } = req.body;

    if (!email) {
      console.error('No email provided');
      return res.status(400).json({ error: 'Email is required' });
    }

    console.log('Email provided:', email);

    console.log('Checking if user exists with id:', req.user.id);
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, organization_id')
      .eq('id', req.user.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing user:', checkError);
      throw checkError;
    }

    if (existingUser) {
      console.log('User already exists:', existingUser);
      return res.json(existingUser);
    }

    console.log('User does not exist, creating new user...');
    
    const insertData = {
      id: req.user.id,
      email,
      full_name,
      role: 'user'
    };
    
    console.log('Inserting user with data:', insertData);

    const { data, error } = await supabase
      .from('users')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error inserting user:', error);
      throw error;
    }

    console.log('User created successfully:', data);
    res.status(201).json(data);
  } catch (error) {
    console.error('POST /users error:', error);
    res.status(500).json({ error: error.message || 'Failed to create user' });
  }
});

router.put('/:id', enforceTenant, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role, full_name } = req.body;

    const updates = {};
    if (role) updates.role = role;
    if (full_name) updates.full_name = full_name;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', req.user.organization_id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/:id', enforceTenant, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id)
      .eq('organization_id', req.user.organization_id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;