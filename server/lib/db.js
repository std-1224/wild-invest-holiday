/**
 * MongoDB Database Connection
 * Connects to MongoDB Atlas using Mongoose
 */
import mongoose from 'mongoose';

let isConnected = false;

/**
 * Connect to MongoDB Atlas
 * Uses connection pooling and caching for serverless environments
 */
export async function connectDB() {
  if (isConnected) {
    console.log('✅ Using existing MongoDB connection');
    return;
  }

  try {
    const dbUrl = process.env.DB_URL;
    
    if (!dbUrl) {
      throw new Error('DB_URL environment variable is not defined');
    }

    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(dbUrl, options);
    
    isConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 * Useful for cleanup in tests or graceful shutdown
 */
export async function disconnectDB() {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error('❌ MongoDB disconnection error:', error);
    throw error;
  }
}

export default connectDB;

