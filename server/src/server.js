import env from './config/env.config.js';

const { testConnection } = await import('./config/db.config.js');
const { default: app } = await import('./app.js');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
