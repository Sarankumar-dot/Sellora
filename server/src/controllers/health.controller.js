const healthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sellora API is running 🚀',
  });

  console.log(req.headers['user-agent']);
};

export default healthCheck;
