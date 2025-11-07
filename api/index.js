// Vercel entry point - redirects to health check
module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({
    message: 'BTEB Result Checker API',
    status: 'online',
    endpoints: [
      'GET /api/health',
      'POST /api/auth/login',
      'POST /api/results/bulk',
      'GET /api/results/:rollNumber'
    ]
  });
};
