require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://eomusapkbhdhhgcqeczv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbXVzYXBrYmhkaGhnY3FlY3p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mjc0NDYwOCwiZXhwIjoyMTA4MzIwNjA4fQ.m94zoKCtmJhDYoq4E3tX_7pIeE3eh7qZ0tJxag_ckPU';
const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET = 'order-designs';

module.exports = async (req, res) => {
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
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        return res.status(400).json({ error: 'Invalid JSON request body' });
      }
    }

    const { image, filename } = body || {};

    if (!image) {
      return res.status(400).json({ error: 'Image data (base64 string) is required.' });
    }

    let mimeType = 'image/jpeg';
    let buffer;
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    }

    const ext = mimeType.includes('png') ? 'png' : (mimeType.includes('webp') ? 'webp' : 'jpg');
    const cleanName = (filename ? filename.replace(/[^a-zA-Z0-9_-]/g, '_') : 'prod') + '_' + Date.now() + '_' + Math.floor(Math.random()*1000);
    const storagePath = `products/${cleanName}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        upsert: true,
        contentType: mimeType
      });

    if (error) {
      console.error('Supabase storage upload error:', error);
      return res.status(500).json({ error: error.message || 'Failed to upload image to storage' });
    }

    const { data: pubData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    const publicUrl = pubData ? pubData.publicUrl : null;

    if (!publicUrl) {
      return res.status(500).json({ error: 'Could not obtain public URL for uploaded image' });
    }

    return res.status(200).json({
      success: true,
      url: publicUrl,
      path: storagePath
    });

  } catch (err) {
    console.error('upload-image error:', err);
    return res.status(500).json({ error: err.message || 'Server error uploading image' });
  }
};
