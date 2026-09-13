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
    const { to, message, type = 'text', templateName = 'hello_world', languageCode = 'en_US' } = req.body || {};

    if (!to) {
      return res.status(400).json({ error: 'Recipient phone number ("to") is required.' });
    }

    // Clean phone number (remove +, spaces, hyphens)
    const cleanPhone = to.toString().replace(/[^0-9]/g, '');

    const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_ID || '1277049988834738';
    const ACCESS_TOKEN = process.env.WHATSAPP_TOKEN || 'EAAYNF1uyJxYBSe6te3ssyYJMA0PZC44UJqDTovYk9zW7EQZBLBNsbECCpiHFk1vukUKaF0pZAXrZBNYuZBZAOcZBIGbh9In4FlIZBPV3PImx2icwBe3LBfZAjfDx1jgqsGrlHj5aqVwlY5JhDGLuZBxe9lAiw92I2uKq683mYfeuH2g5F20OXITuiiMiTEPCpP4gZDZD';

    let payload = {
      messaging_product: 'whatsapp',
      to: cleanPhone
    };

    if (type === 'template') {
      payload.type = 'template';
      payload.template = {
        name: templateName,
        language: { code: languageCode }
      };
    } else {
      payload.type = 'text';
      payload.text = {
        preview_url: false,
        body: message || 'Hello from Design Suvidha!'
      };
    }

    const response = await fetch(`https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.error || data,
        meta_error: data.error ? data.error.message : 'Unknown Meta Error'
      });
    }

    return res.status(200).json({
      success: true,
      message_id: data.messages && data.messages[0] ? data.messages[0].id : null,
      to: cleanPhone,
      timestamp: new Date().toISOString(),
      payload
    });
  } catch (err) {
    console.error('Send WhatsApp Error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};
