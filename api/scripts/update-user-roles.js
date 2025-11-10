/**
 * Migration script to add 'role' field to existing users
 * Run this once to update all existing users to have role='owner'
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

async function updateUserRoles() {
  try {
    await mongoose.connect(MONGODB_URI);

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    // Find all users without a role field or with null/undefined role
    const usersWithoutRole = await User.find({
      $or: [
        { role: { $exists: false } },
        { role: null },
        { role: '' }
      ]
    });

    if (usersWithoutRole.length === 0) {
      await mongoose.connection.close();
      return;
    }

    // Update all users to have role='owner'
    const result = await User.updateMany(
      {
        $or: [
          { role: { $exists: false } },
          { role: null },
          { role: '' }
        ]
      },
      {
        $set: { role: 'owner' }
      }
    );

    // Verify the update
    const verifyUsers = await User.find({ role: 'owner' });

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the migration
updateUserRoles();

