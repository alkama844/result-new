const ADMIN_EMAILS = [
  "nafijrahaman2026@gmail.com",
  "nafijrahaman19721@gmail.com",
  "nafijrahaman2022@gmail.com"
];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (ADMIN_EMAILS.includes(email)) {
      res.status(200).json({ success: true, message: 'Login successful' });
    } else {
      res.status(403).json({ success: false, message: 'Not authorized' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
