require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL || 'https://eomusapkbhdhhgcqeczv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbXVzYXBrYmhkaGhnY3FlY3p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mjc0NDYwOCwiZXhwIjoyMTA4MzIwNjA4fQ.m94zoKCtmJhDYoq4E3tX_7pIeE3eh7qZ0tJxag_ckPU';
const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET = 'order-designs';
const FILE_PATH = 'products-catalog.json';

function getLocalDefaultProducts() {
  try {
    const filePath = path.join(process.cwd(), 'all_products_catalog.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch(e) {
    console.error('Error reading local catalog:', e);
  }
  return [];
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. SAVE PRODUCTS (Admin updating price, stock, images)
  if (req.method === 'POST') {
    try {
      let products = req.body;
      if (typeof products === 'string') {
        products = JSON.parse(products);
      }

      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'Valid products array required' });
      }

      const buffer = Buffer.from(JSON.stringify(products, null, 2), 'utf8');
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .upload(FILE_PATH, buffer, {
          upsert: true,
          contentType: 'application/json'
        });

      if (error) {
        console.error('Failed uploading catalog to Supabase storage:', error);
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({
        success: true,
        message: 'Products catalog updated across all devices',
        count: products.length
      });
    } catch (err) {
      console.error('POST /api/products error:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // 2. GET PRODUCTS (For customers on all devices and admin portal)
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .download(FILE_PATH);

    if (!error && data) {
      const text = await data.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return res.status(200).json(parsed);
      }
    }

    // Fallback: seed from local catalog
    const local = getLocalDefaultProducts();
    if (local && local.length > 0) {
      // Background seed
      supabase.storage.from(BUCKET).upload(FILE_PATH, Buffer.from(JSON.stringify(local), 'utf8'), {
        upsert: true,
        contentType: 'application/json'
      }).catch(e => console.warn('Catalog seed error:', e));

      return res.status(200).json(local);
    }

    return res.status(200).json([]);
  } catch (err) {
    console.error('GET /api/products error:', err);
    const local = getLocalDefaultProducts();
    return res.status(200).json(local);
  }
};
