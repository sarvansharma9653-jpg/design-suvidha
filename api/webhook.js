// In-memory cache for recent messages in serverless instance
let recentEvents = [];

module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'design_suvidha_12345';

  // 1. CRM Dashboard Query (Fetch recent incoming messages)
  if (req.method === 'GET' && req.query.action === 'get_events') {
    return res.status(200).json({
      success: true,
      count: recentEvents.length,
      events: recentEvents
    });
  }

  // 2. Verification for Meta (GET or HEAD request)
  if (req.method === 'GET' || req.method === 'HEAD') {
    const token = req.query['hub.verify_token'] || req.query['hub_verify_token'] || req.query['verify_token'];
    const challenge = req.query['hub.challenge'] || req.query['hub_challenge'] || req.query['challenge'];

    if (token === VERIFY_TOKEN) {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(challenge || '');
    } else {
      return res.status(403).send('Verification token mismatch');
    }
  }

  // 3. Receiving Webhook Events from Meta (POST request)
  if (req.method === 'POST') {
    try {
      const body = req.body;
      const timestamp = new Date().toISOString();

      if (body && body.entry) {
        body.entry.forEach(entry => {
          if (entry.changes) {
            entry.changes.forEach(change => {
              const val = change.value;
              if (val && val.messages) {
                val.messages.forEach(msg => {
                  const contact = (val.contacts && val.contacts[0]) ? val.contacts[0] : {};
                  const eventItem = {
                    id: msg.id,
                    from: msg.from,
                    senderName: contact.profile ? contact.profile.name : msg.from,
                    type: msg.type,
                    text: msg.text ? msg.text.body : (msg.type === 'button' ? msg.button.text : `[${msg.type}]`),
                    timestamp: msg.timestamp ? new Date(parseInt(msg.timestamp) * 1000).toISOString() : timestamp
                  };

                  recentEvents.unshift(eventItem);
                  if (recentEvents.length > 100) recentEvents.pop();
                  console.log('New Inbound WhatsApp Message:', eventItem);
                });
              }
            });
          }
        });
      }

      return res.status(200).send('EVENT_RECEIVED');
    } catch (err) {
      console.error('Webhook error:', err);
      return res.status(200).send('EVENT_PROCESSED_WITH_ERROR');
    }
  }

  return res.status(405).send('Method Not Allowed');
};
