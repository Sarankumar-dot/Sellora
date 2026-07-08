const healthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Sellora API is running 🚀',
  });
};

export default healthCheck;
