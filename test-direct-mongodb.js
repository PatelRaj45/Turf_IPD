import mongoose from 'mongoose';

// Directly use the MongoDB connection string
const MONGO_URI = 'mongodb+srv://TurfBooking:TurfBooking@turfbooking.sdkbh8z.mongodb.net/?retryWrites=true&w=majority&appName=TurfBooking';

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