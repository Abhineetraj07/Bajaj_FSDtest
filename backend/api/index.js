module.exports = (_req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    status: 'ok',
    endpoint: 'POST /bfhl',
    content_type: 'application/json',
  });
};
