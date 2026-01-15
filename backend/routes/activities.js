const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const { enforceTenant } = require('../middleware/tenant');

router.get('/', enforceTenant, async (req, res) => {
  try {
    const { regarding_type, regarding_id } = req.query;

    let query = supabase
      .from('activities')
      .select('*')
      .eq('organization_id', req.user.organization_id);

    if (regarding_type && regarding_id) {
      query = query.eq('regarding_type', regarding_type).eq('regarding_id', regarding_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

router.get('/:id', enforceTenant, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('id', id)
      .eq('organization_id', req.user.organization_id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

router.post('/', enforceTenant, async (req, res) => {
  try {
    const { type, subject, description, due_date, completed, regarding_type, regarding_id } = req.body;

    if (!type || !subject) {
      return res.status(400).json({ error: 'Type and subject are required' });
    }

    const { data, error } = await supabase
      .from('activities')
      .insert({
        organization_id: req.user.organization_id,
        type,
        subject,
        description,
        due_date,
        completed: completed || false,
        regarding_type,
        regarding_id,
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

router.put('/:id', enforceTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { type, subject, description, due_date, completed, regarding_type, regarding_id } = req.body;

    const updates = {};
    if (type !== undefined) updates.type = type;
    if (subject !== undefined) updates.subject = subject;
    if (description !== undefined) updates.description = description;
    if (due_date !== undefined) updates.due_date = due_date;
    if (completed !== undefined) updates.completed = completed;
    if (regarding_type !== undefined) updates.regarding_type = regarding_type;
    if (regarding_id !== undefined) updates.regarding_id = regarding_id;

    const { data, error } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', req.user.organization_id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({ error: 'Failed to update activity' });
  }
});

router.delete('/:id', enforceTenant, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)
      .eq('organization_id', req.user.organization_id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting activity:', error);
    res.status(500).json({ error: 'Failed to delete activity' });
  }
});

module.exports = router;