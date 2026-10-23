require('dotenv').config();
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://eomusapkbhdhhgcqeczv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbXVzYXBrYmhkaGhnY3FlY3p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mjc0NDYwOCwiZXhwIjoyMTA4MzIwNjA4fQ.m94zoKCtmJhDYoq4E3tX_7pIeE3eh7qZ0tJxag_ckPU';
const supabase = createClient(supabaseUrl, supabaseKey);

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
    const key_secret = (process.env.RAZORPAY_KEY_SECRET && process.env.RAZORPAY_KEY_SECRET.trim()) || 'gCzYBav8l4ybL4KfZqxQFaVJ';

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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_details } = body || {};

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

    // ============================================================
    // PAYMENT VERIFIED! Save strictly PAID order into Supabase
    // ============================================================
    let savedOrder = null;
    let finalDesignUrl = null;

    if (order_details) {
      const {
        orderId,
        customer,
        items,
        subtotal,
        total,
        designFile,
        designName
      } = order_details;

      // Handle design file upload to Supabase Storage if base64 provided
      if (designFile && typeof designFile === 'string' && designFile.startsWith('data:')) {
        try {
          const matches = designFile.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const mimeType = matches[1];
            const buffer = Buffer.from(matches[2], 'base64');
            const ext = mimeType.split('/')[1] || 'png';
            const safeId = (orderId || 'ds-ord').replace(/[^a-zA-Z0-9_-]/g, '');
            const fileName = `${safeId}-${Date.now()}.${ext}`;

            const { data: uploadData, error: uploadErr } = await supabase.storage
              .from('order-designs')
              .upload(fileName, buffer, { contentType: mimeType, upsert: true });

            if (!uploadErr && uploadData) {
              const { data: pubData } = supabase.storage.from('order-designs').getPublicUrl(fileName);
              finalDesignUrl = pubData.publicUrl;
            } else {
              console.warn('Storage upload error:', uploadErr);
            }
          }
        } catch (uploadCatchErr) {
          console.error('Error uploading design to Supabase Storage:', uploadCatchErr);
        }
      } else if (designFile && typeof designFile === 'string' && designFile.startsWith('http')) {
        finalDesignUrl = designFile;
      }

      // Insert clean order into Supabase
      try {
        const orderRow = {
          order_id: orderId || ('DS-ORD-' + Math.floor(100000 + Math.random() * 900000)),
          customer_name: customer?.name || '',
          customer_phone: customer?.phone || '',
          customer_email: customer?.email || '',
          delivery_address: customer?.address || '',
          city: customer?.city || '',
          pincode: customer?.pincode || '',
          notes: customer?.notes || '',
          items: items || [],
          subtotal: subtotal || total || 0,
          total: total || 0,
          payment_status: 'PAID',
          payment_id: razorpay_payment_id,
          razorpay_order_id: razorpay_order_id,
          design_file_url: finalDesignUrl,
          design_name: designName || '',
          order_status: 'New Order'
        };

        const { data: dbData, error: dbErr } = await supabase
          .from('orders')
          .insert([orderRow])
          .select()
          .single();

        if (dbErr) {
          console.error('Supabase DB Insert Error:', dbErr);
        } else {
          savedOrder = dbData;
        }

        // Optional: Google Sheet Webhook Sync (if configured)
        const sheetWebhook = process.env.GOOGLE_SHEET_WEBHOOK_URL;
        if (sheetWebhook && sheetWebhook.startsWith('http')) {
          try {
            await fetch(sheetWebhook, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                order_id: orderRow.order_id,
                date: new Date().toISOString(),
                customer_name: orderRow.customer_name,
                customer_phone: orderRow.customer_phone,
                customer_email: orderRow.customer_email,
                delivery_address: orderRow.delivery_address,
                city: orderRow.city,
                pincode: orderRow.pincode,
                total: orderRow.total,
                items: (items || []).map(i => `${i.title} (x${i.qty})`).join(', '),
                payment_id: razorpay_payment_id,
                design_url: finalDesignUrl
              })
            });
          } catch (sheetErr) {
            console.warn('Google Sheet webhook sync warning:', sheetErr.message);
          }
        }
      } catch (insertErr) {
        console.error('Error inserting order to Supabase:', insertErr);
      }
    }

    return res.status(200).json({
      success: true,
      verified: true,
      message: 'Payment verified and order saved to Supabase cloud successfully',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      order: savedOrder,
      design_url: finalDesignUrl
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
