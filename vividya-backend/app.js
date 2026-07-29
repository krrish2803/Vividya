import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/database.js';
import errorHandler from './middleware/errorMiddleware.js';
import logger from './utils/logger.js';
import { initQdrantCollection } from './services/ragService.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/users.routes.js';
import chatRoutes from './routes/chat.routes.js';
import noteRoutes from './routes/notes.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Initialize Qdrant vector collection
initQdrantCollection().catch(err => logger.error(`Qdrant init error: ${err.message}`));

// Middleware
const allowedOrigins = [
  'http://localhost:3001',
  'https://vividya-krrish.netlify.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin === process.env.CORS_ORIGIN) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Vividya API is running', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/chat', chatRoutes);
app.use('/notes', noteRoutes);
app.use('/dashboard', dashboardRoutes);

// Phase 2 Routes
import wellnessRoutes from './routes/wellnessRoutes.js';
import careerRoutes from './routes/careerRoutes.js';
import timetableRoutes from './routes/timetableRoutes.js';
import ragRoutes from './routes/ragRoutes.js';

app.use('/wellness', wellnessRoutes);
app.use('/career', careerRoutes);
app.use('/timetable', timetableRoutes);
app.use('/rag', ragRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`Vividya backend running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
