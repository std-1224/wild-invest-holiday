/**
 * Script to check a specific user's data
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env') });

const MONGODB_URI = process.env.DB_URL || process.env.MONGODB_URI;

async function checkUser() {
  try {
    await mongoose.connect(MONGODB_URI);

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // Find all users
    const users = await User.find({}).limit(5);

    if (users.length === 0) {
      await mongoose.connection.close();
      return;
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
checkUser();

