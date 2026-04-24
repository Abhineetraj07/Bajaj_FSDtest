const { processData } = require('../lib/processor');
const identity = require('../lib/identity');

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Use POST.' });
    return;
  }

  const body = req.body;
  if (!body || !Array.isArray(body.data)) {
    res.status(400).json({ error: 'Request body must be { "data": string[] }' });
    return;
  }

  const result = processData(body.data, identity);
  res.status(200).json(result);
};
