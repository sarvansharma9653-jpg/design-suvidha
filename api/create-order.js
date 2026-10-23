require('dotenv').config();
const Razorpay = require('razorpay');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const key_id = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID.trim()) || 'rzp_live_TrHEz6RpcSg3uA';
    const key_secret = (process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_SECRET.trim()) || 'gCzYBav8l4ybL4KfZqxQFaVJ';

    if (!key_id || !key_secret) {
      return res.status(401).json({
        error: 'Razorpay API credentials not configured in environment (RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)'
      });
    }

    // Parse body safely
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON request body' });
      }
    }
    const { amount, currency = 'INR', receipt, notes } = body || {};

    // Validate amount (in paise, minimum 100 paise = 1 INR)
    const numericAmount = parseInt(amount, 10);
    if (isNaN(numericAmount) || numericAmount < 100) {
      return res.status(400).json({
        error: 'Invalid amount. Minimum amount is 100 paise (₹1.00).'
      });
    }

    const razorpay = new Razorpay({
      key_id: key_id,
      key_secret: key_secret
    });

    const options = {
      amount: numericAmount,
      currency: currency || 'INR',
      receipt: receipt || ('rcpt_' + Date.now().toString().slice(-8)),
      notes: notes || {}
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      key_id: key_id // Public key for frontend checkout modal
    });

  } catch (error) {
    console.error('Error creating Razorpay order:', error);

    // Handle authentication error specifically
    if (error.statusCode === 401 || (error.error && error.error.code === 'BAD_REQUEST_ERROR')) {
      return res.status(error.statusCode || 401).json({
        error: error.error?.description || 'Razorpay authentication / request failed'
      });
    }

    return res.status(500).json({
      error: error.message || 'Failed to create Razorpay order'
    });
  }
};
