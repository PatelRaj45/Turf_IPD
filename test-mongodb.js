import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Check if .env file exists and print its contents
const envPath = path.join(__dirname, '.env');
console.log('Checking .env file at:', envPath);
if (fs.existsSync(envPath)) {
  console.log('.env file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('Contents of .env file:');
  console.log(envContent);
} else {
  console.log('.env file does not exist at this location');
}

// Print environment variables
console.log('Environment variables:');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Try to connect to MongoDB if MONGO_URI is defined
if (process.env.MONGO_URI) {
  console.log('Attempting to connect to MongoDB...');
  
  mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000
  })
  .then(conn => {
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    process.exit(0);
  })
  .catch(error => {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  });
} else {
  console.error('MONGO_URI is not defined in environment variables');
  process.exit(1);
}