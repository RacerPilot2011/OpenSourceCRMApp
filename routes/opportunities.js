const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const { enforceTenant, requireAdmin } = require('../middleware/tenant');

router.get('/', enforceTenant, async (req, res) => {
  try {
    const { account_id } = req.query;

    let query = supabase
      .from('opportunities')
      .select('*, accounts(name), contacts(first_name, last_name)')
      .eq('organization_id', req.user.organization_id);

    if (account_id) {
      query = query.eq('account_id', account_id);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch opportunities' });
  }
});

router.get('/:id', enforceTenant, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('opportunities')
      .select('*, accounts(name), contacts(first_name, last_name)')
      .eq('id', id)
      .eq('organization_id', req.user.organization_id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error fetching opportunity:', error);
    res.status(500).json({ error: 'Failed to fetch opportunity' });
  }
});

router.post('/', enforceTenant, async (req, res) => {
  try {
    const { account_id, contact_id, name, amount, stage, probability, close_date, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const { data, error } = await supabase
      .from('opportunities')
      .insert({
        organization_id: req.user.organization_id,
        account_id,
        contact_id,
        name,
        amount,
        stage: stage || 'qualify',
        probability,
        close_date,
        description,
        created_by: req.user.id
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating opportunity:', error);
    res.status(500).json({ error: 'Failed to create opportunity' });
  }
});

router.put('/:id', enforceTenant, async (req, res) => {
  try {
    const { id } = req.params;
    const { account_id, contact_id, name, amount, stage, probability, close_date, description } = req.body;

    const updates = {};
    if (account_id !== undefined) updates.account_id = account_id;
    if (contact_id !== undefined) updates.contact_id = contact_id;
    if (name !== undefined) updates.name = name;
    if (amount !== undefined) updates.amount = amount;
    if (stage !== undefined) updates.stage = stage;
    if (probability !== undefined) updates.probability = probability;
    if (close_date !== undefined) updates.close_date = close_date;
    if (description !== undefined) updates.description = description;

    const { data, error } = await supabase
      .from('opportunities')
      .update(updates)
      .eq('id', id)
      .eq('organization_id', req.user.organization_id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error updating opportunity:', error);
    res.status(500).json({ error: 'Failed to update opportunity' });
  }
});

router.delete('/:id', enforceTenant, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', id)
      .eq('organization_id', req.user.organization_id);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting opportunity:', error);
    res.status(500).json({ error: 'Failed to delete opportunity' });
  }
});

module.exports = router;