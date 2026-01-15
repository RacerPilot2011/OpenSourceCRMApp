const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const { enforceTenant, requireAdmin } = require('../middleware/tenant');

router.get('/', enforceTenant, async (req, res) => {
  try {
    const { account_id } = req.query;

    let query = supabase
      .from('contacts')
      .select('*, accounts(name)')
      .eq('organization_id', req.user.organization_id);

    if (account_id) {
      query = query.eq('account_id', account_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

router.get('/:id', enforceTenant, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('contacts')
      .select('*, accounts(name)')
      .eq('id', id)
      .eq('organization_id', req.user.organization_id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching contact:', error);
    res.status(500).json({ error: 'Failed to fetch contact' });
  }
});

router.post('/', enforceTenant, async (req, res) => {
  try {
    const { account_id, first_name, last_name, email, phone, mobile, title, department } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        organization_id: req.user.organization_id,
        account_id,
        first_name,
        last_name,
        email,
        phone,
        mobile,
        title,
        department,
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

router.put('/:id', enforceTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { account_id, first_name, last_name, email, phone, mobile, title, department } = req.body;

    const updates = {};
    if (account_id !== undefined) updates.account_id = account_id;
    if (first_name !== undefined) updates.first_name = first_name;
    if (last_name !== undefined) updates.last_name = last_name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (mobile !== undefined) updates.mobile = mobile;
    if (title !== undefined) updates.title = title;
    if (department !== undefined) updates.department = department;

    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', req.user.organization_id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

router.delete('/:id', enforceTenant, requireAdmin, async (req, res) => {
try {
const { id } = req.params;const { error } = await supabase
  .from('contacts')
  .delete()
  .eq('id', id)
  .eq('organization_id', req.user.organization_id);if (error) throw error;res.json({ success: true });
} catch (error) {
console.error('Error deleting contact:', error);
res.status(500).json({ error: 'Failed to delete contact' });
}
});module.exports = router;