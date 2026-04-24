const express = require('express');
const cors = require('cors');
const { processData } = require('./lib/processor');
const identity = require('./lib/identity');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.json({ status: 'ok', endpoint: 'POST /bfhl' });
});

app.post('/bfhl', (req, res) => {
  if (!req.body || !Array.isArray(req.body.data)) {
    return res.status(400).json({ error: 'Request body must be { "data": string[] }' });
  }
  const result = processData(req.body.data, identity);
  res.status(200).json(result);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`bfhl backend running on http://localhost:${PORT}`);
});
