import dotenv from 'dotenv';
import { testConnection } from './config/db.config..js';
dotenv.config();

import app from './app.js';

const PORT = process.env.port || 5000;

const startServer = async () => {
  await testConnection();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
