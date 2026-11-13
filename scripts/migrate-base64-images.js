require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL || 'https://eomusapkbhdhhgcqeczv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvbXVzYXBrYmhkaGhnY3FlY3p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mjc0NDYwOCwiZXhwIjoyMTA4MzIwNjA4fQ.m94zoKCtmJhDYoq4E3tX_7pIeE3eh7qZ0tJxag_ckPU';
const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET = 'order-designs';
const FILE_PATH = 'products-catalog.json';

async function uploadBase64ToStorage(base64Data, filename) {
  try {
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let mimeType = 'image/jpeg';
    let buffer;
    if (matches && matches.length === 3) {
      mimeType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
    } else {
      buffer = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    }

    const ext = mimeType.includes('png') ? 'png' : (mimeType.includes('webp') ? 'webp' : 'jpg');
    const storagePath = `products/${filename}.${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        upsert: true,
        contentType: mimeType
      });

    if (error) {
      console.error(`Error uploading ${storagePath}:`, error.message);
      return null;
    }

    const { data: pubData } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    return pubData ? pubData.publicUrl : null;
  } catch(e) {
    console.error(`Upload exception for ${filename}:`, e.message);
    return null;
  }
}

async function runMigration() {
  console.log('Downloading catalog from Supabase...');
  const res = await supabase.storage.from(BUCKET).download(FILE_PATH);
  if (res.error) {
    console.error('Failed to download catalog:', res.error);
    return;
  }

  const text = await res.data.text();
  console.log(`Original catalog size: ${(text.length / 1024 / 1024).toFixed(2)} MB`);
  const products = JSON.parse(text);
  console.log(`Loaded ${products.length} products.`);

  let totalUploaded = 0;

  for (let idx = 0; idx < products.length; idx++) {
    const p = products[idx];
    const safeId = (p.id || 'prod_' + idx).replace(/[^a-zA-Z0-9_-]/g, '_');

    // 1. Check primary image
    if (p.img && p.img.startsWith('data:image')) {
      console.log(`Uploading primary image for [${p.id}] ${p.title.slice(0, 30)}...`);
      const publicUrl = await uploadBase64ToStorage(p.img, `${safeId}_main`);
      if (publicUrl) {
        p.img = publicUrl;
        totalUploaded++;
      }
    }

    // 2. Check carousel images array
    if (Array.isArray(p.images)) {
      for (let i = 0; i < p.images.length; i++) {
        const item = p.images[i];
        if (item && item.startsWith('data:image')) {
          console.log(`Uploading carousel #${i} for [${p.id}]...`);
          const publicUrl = await uploadBase64ToStorage(item, `${safeId}_img_${i}`);
          if (publicUrl) {
            p.images[i] = publicUrl;
            totalUploaded++;
          }
        }
      }
    }
  }

  console.log(`Finished uploading ${totalUploaded} images to Supabase storage CDN.`);

  const newCatalogJson = JSON.stringify(products, null, 2);
  console.log(`New catalog size: ${(newCatalogJson.length / 1024).toFixed(2)} KB`);

  console.log('Saving optimized catalog back to Supabase...');
  const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(FILE_PATH, Buffer.from(newCatalogJson, 'utf8'), {
    upsert: true,
    contentType: 'application/json'
  });

  if (uploadErr) {
    console.error('Failed to upload optimized catalog:', uploadErr);
  } else {
    console.log('Successfully updated Supabase storage catalog!');
  }

  // Also save locally to all_products_catalog.json as backup
  fs.writeFileSync(path.join(process.cwd(), 'all_products_catalog.json'), newCatalogJson, 'utf8');
  console.log('Updated local all_products_catalog.json backup.');
}

runMigration().catch(console.error);
