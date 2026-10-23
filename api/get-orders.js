require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://eomusapkbhdhhgcqeczv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbXVzYXBrYmhkaGhnY3FlY3p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mjc0NDYwOCwiZXhwIjoyMTA4MzIwNjA4fQ.m94zoKCtmJhDYoq4E3tX_7pIeE3eh7qZ0tJxag_ckPU';
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. UPDATE ORDER STATUS (For Admin)
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch(e) {}
      }

      const { action, order_id, new_status } = body || {};
      if (action === 'update_status' && order_id && new_status) {
        const { data, error } = await supabase
          .from('orders')
          .update({ order_status: new_status })
          .eq('order_id', order_id)
          .select();

        if (error) {
          return res.status(500).json({ success: false, error: error.message });
        }
        return res.status(200).json({ success: true, updated: data });
      }

      return res.status(400).json({ success: false, error: 'Invalid action' });
    }

    // 2. GET ORDERS
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const phone = url.searchParams.get('phone');
    const order_id = url.searchParams.get('order_id');

    let query = supabase
      .from('orders')
      .select('*')
      .eq('payment_status', 'PAID')
      .order('created_at', { ascending: false });

    // Filter by customer phone if customer lookup
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, '').slice(-10);
      query = query.ilike('customer_phone', `%${cleanPhone}%`);
    } else if (order_id) {
      query = query.eq('order_id', order_id);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('Error fetching orders from Supabase:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(200).json({
      success: true,
      count: orders ? orders.length : 0,
      orders: orders || []
    });

  } catch (err) {
    console.error('get-orders API error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
