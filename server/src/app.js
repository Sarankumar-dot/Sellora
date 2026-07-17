import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import router from './routes/health.routes.js';
import errorHandler from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

// Security Headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Parse JSON
app.use(express.json());

// Parse URL Encoded Data
app.use(express.urlencoded({ extended: true }));

// Parse Cookies
app.use(cookieParser());

// Logger
app.use(morgan('dev'));

app.use('/api', router);
app.use('/api/auth', authRoutes);

//Error Middleware
app.use(errorHandler);

export default app;
