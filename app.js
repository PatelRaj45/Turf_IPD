import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';

// Load environment variables
dotenv.config();
dotenv.config({ path: '.env.local' });

// Log important environment variables for debugging (remove in production)
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('JWT_EXPIRE exists:', !!process.env.JWT_EXPIRE);
console.log('JWT_COOKIE_EXPIRE exists:', !!process.env.JWT_COOKIE_EXPIRE);

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import turfRoutes from './routes/turfs.js';
import bookingRoutes from './routes/bookings.js';
import teamRoutes from './routes/teams.js';
import paymentRoutes from './routes/payments.js';
import matchmakingRoutes from './routes/matchmaking.js';
import dashboardRoutes from './routes/dashboard.js';
import healthRoutes from './routes/health.js';

// Import error handler middleware
import { errorHandler } from './middlewares/errorHandler.js';

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/turfs', turfRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/matchmaking', matchmakingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/health', healthRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to TurfX API');
});

// Error handling middleware
app.use(errorHandler);

// Export the app without starting the server or connecting to the database
// This allows server.js to handle these responsibilities
// This prevents duplicate database connections

export default app;