const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const { enforceTenant, requireAdmin } = require('../middleware/tenant');

router.get('/', enforceTenant, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('organization_id', req.user.organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

router.get('/:id', enforceTenant, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .eq('organization_id', req.user.organization_id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

router.post('/', enforceTenant, async (req, res) => {
  try {
    const { first_name, last_name, email, phone, company, title, status, source, rating } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    const { data, error } = await supabase
      .from('leads')
      .insert({
        organization_id: req.user.organization_id,
        first_name,
        last_name,
        email,
        phone,
        company,
        title,
        status: status || 'new',
        source,
        rating,
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: 'Failed to create lead' });
  }
});

router.put('/:id', enforceTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, email, phone, company, title, status, source, rating } = req.body;

    const updates = {};
    if (first_name !== undefined) updates.first_name = first_name;
    if (last_name !== undefined) updates.last_name = last_name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (company !== undefined) updates.company = company;
    if (title !== undefined) updates.title = title;
    if (status !== undefined) updates.status = status;
    if (source !== undefined) updates.source = source;
    if (rating !== undefined) updates.rating = rating;

    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', req.user.organization_id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

router.delete('/:id', enforceTenant, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
      .eq('organization_id', req.user.organization_id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

module.exports = router;