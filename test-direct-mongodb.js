import mongoose from 'mongoose';

// Directly use the MongoDB connection string
const MONGO_URI = 'mongodb+srv://rajbhaveshpatel1:yKKUw14c3kyX8929@cluster0.v7m6ruh.mongodb.net/sample_mflix?retryWrites=true&w=majority&appName=Cluster0';

console.log('Attempting to connect to MongoDB...');

mongoose.connect(MONGO_URI, {
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