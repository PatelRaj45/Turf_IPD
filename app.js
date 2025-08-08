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

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

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

// Debug matchmaking routes
console.log('Mounting matchmaking routes...');
console.log('Available matchmaking routes:', Object.keys(matchmakingRoutes));
app.use('/api/matchmaking', matchmakingRoutes);

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/health', healthRoutes);

// Test route for debugging
app.get('/api/test', (req, res) => {
  console.log('Test route hit');
  return res.json({ message: 'Test route working' });
});

// Remove direct routes that conflict with the matchmaking routes
// The proper routes are now handled by the matchmakingRoutes in routes/matchmaking.js

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