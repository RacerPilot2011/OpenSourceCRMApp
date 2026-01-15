const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase'); 

router.get('/', async (req, res) => {
  try {
    const orgId = req.user.organization_id;

    const { data, error } = await supabase
      .from('invoices')
      .select(`*, accounts (name)`)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const formattedData = data.map(inv => ({
      ...inv,
      account_name: inv.accounts ? inv.accounts.name : 'Unknown'
    }));
    res.json(formattedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const orgId = req.user.organization_id;
    const { account_id, number, status, amount, due_date } = req.body;

    const { data, error } = await supabase
      .from('invoices')
      .insert([{ 
        account_id, number, status, amount, due_date, 
        organization_id: orgId
      }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;