module.exports = (req, res) => {
  const VERIFY_TOKEN = "design_suvidha_12345";

  // 1. Verification for Meta (GET request)
  if (req.method === 'GET') {
    const token = req.query['hub.verify_token'] || req.query['hub_verify_token'] || req.query['verify_token'];
    const challenge = req.query['hub.challenge'] || req.query['hub_challenge'] || req.query['challenge'];

    if (token === VERIFY_TOKEN) {
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(challenge);
    } else {
      return res.status(403).send("Verification token mismatch");
    }
  }

  // 2. Receiving Webhook Events (POST request)
  if (req.method === 'POST') {
    console.log("WhatsApp Webhook Event:", JSON.stringify(req.body, null, 2));
    return res.status(200).send("EVENT_RECEIVED");
  }

  return res.status(405).send("Method Not Allowed");
};
