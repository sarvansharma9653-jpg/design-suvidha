require('dotenv').config();
const crypto = require('crypto');

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
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret) {
      return res.status(500).json({
        error: 'Razorpay secret key not configured in environment'
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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body || {};

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Missing required parameters: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.'
      });
    }

    // Compute HMAC-SHA256 signature
    const hmac = crypto.createHmac('sha256', key_secret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest('hex');

    // Safe signature comparison (constant-time check if lengths match)
    const genBuf = Buffer.from(generated_signature, 'utf8');
    const sigBuf = Buffer.from(razorpay_signature, 'utf8');
    const isSignatureValid = (genBuf.length === sigBuf.length) && crypto.timingSafeEqual(genBuf, sigBuf);

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        verified: false,
        error: 'Payment verification failed: Signature mismatch. Order not marked as paid.'
      });
    }

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Payment verified successfully',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id
    });

  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return res.status(500).json({
      success: false,
      verified: false,
      error: error.message || 'Server error during signature verification'
    });
  }
};
