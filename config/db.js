import mongoose from 'mongoose';

// Maximum number of connection attempts
const MAX_RETRIES = 3;
// Delay between retries in milliseconds
const RETRY_DELAY = 5000;

// Directly use the MongoDB connection string if environment variable is not available
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://rajbhaveshpatel1:yKKUw14c3kyX8929@cluster0.v7m6ruh.mongodb.net/sample_mflix?retryWrites=true&w=majority&appName=Cluster0';

/**
 * Connect to MongoDB with retry logic
 * @param {number} retryCount - Current retry attempt (default: 0)
 * @returns {Promise<mongoose.Connection>} Mongoose connection
 */
const connectDB = async (retryCount = 0) => {
  try {
    console.log('Attempting to connect to MongoDB...');
    
    // Set connection options
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of 30
      // These options are no longer needed in Mongoose 6+
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // useCreateIndex: true,
      // useFindAndModify: false
    };
    
    const conn = await mongoose.connect(MONGO_URI, options);
    
    // Set up error handler for the connection
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    // Set up disconnection handler
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    
    // If we haven't reached the maximum number of retries, try again
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying connection in ${RETRY_DELAY/1000} seconds... (Attempt ${retryCount + 1} of ${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectDB(retryCount + 1);
    } else {
      console.error(`Failed to connect to MongoDB after ${MAX_RETRIES} attempts.`);
      console.warn('Application will continue without database connection.');
      // Don't exit the process, let the application continue without DB
      // process.exit(1);
      return null;
    }
  }
};

export { connectDB };