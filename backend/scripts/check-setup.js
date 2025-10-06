/**
 * Check backend configuration and dependencies
 * Run: node scripts/check-setup.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🔍 RAGhost Backend Configuration Check\n');
console.log('='.repeat(50));

// Load .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

let hasErrors = false;

// 1. Check .env file
console.log('\n📄 Environment File:');
if (fs.existsSync(path.join(__dirname, '..', '.env'))) {
  console.log('  ✅ .env file exists');
} else {
  console.log('  ❌ .env file MISSING!');
  console.log('     → Copy .env.example to .env and configure it');
  hasErrors = true;
}

// 2. Check environment variables
console.log('\n⚙️  Environment Variables:');

const requiredEnvVars = {
  'PORT': process.env.PORT,
  'MONGODB_URI': process.env.MONGODB_URI,
  'ENCRYPTION_KEY': process.env.ENCRYPTION_KEY,
  'FIREBASE_SERVICE_ACCOUNT_PATH': process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
};

for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (value && !value.includes('PLEASE_GENERATE') && !value.includes('your-')) {
    console.log(`  ✅ ${key}: Set`);
  } else {
    console.log(`  ❌ ${key}: NOT SET or using placeholder value`);
    hasErrors = true;
  }
}

// 3. Check Firebase service account
console.log('\n🔥 Firebase Configuration:');
const firebasePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';
const absoluteFirebasePath = path.join(__dirname, '..', firebasePath);

if (fs.existsSync(absoluteFirebasePath)) {
  console.log('  ✅ firebase-service-account.json exists');
  try {
    const content = JSON.parse(fs.readFileSync(absoluteFirebasePath, 'utf8'));
    if (content.project_id && content.private_key && content.client_email) {
      console.log('  ✅ Firebase service account JSON is valid');
      console.log(`     Project ID: ${content.project_id}`);
    } else {
      console.log('  ❌ Firebase service account JSON is incomplete');
      hasErrors = true;
    }
  } catch (err) {
    console.log('  ❌ Firebase service account JSON is invalid:', err.message);
    hasErrors = true;
  }
} else {
  console.log('  ❌ firebase-service-account.json MISSING!');
  console.log('     → Download from Firebase Console → Project Settings → Service Accounts');
  hasErrors = true;
}

// 4. Check MongoDB connection string format
console.log('\n🗄️  Database Configuration:');
if (process.env.MONGODB_URI) {
  if (process.env.MONGODB_URI.startsWith('mongodb+srv://') || process.env.MONGODB_URI.startsWith('mongodb://')) {
    console.log('  ✅ MongoDB URI format looks correct');
    
    if (process.env.MONGODB_URI.includes('your-username') || process.env.MONGODB_URI.includes('<username>')) {
      console.log('  ⚠️  MongoDB URI still contains placeholder values');
      console.log('     → Replace with your actual MongoDB Atlas credentials');
      hasErrors = true;
    }
  } else {
    console.log('  ❌ MongoDB URI format is invalid');
    hasErrors = true;
  }
} else {
  console.log('  ❌ MONGODB_URI not set');
  hasErrors = true;
}

// 5. Check encryption key
console.log('\n🔐 Security Configuration:');
if (process.env.ENCRYPTION_KEY) {
  if (process.env.ENCRYPTION_KEY.length === 64) {
    console.log('  ✅ Encryption key is correct length (64 hex characters)');
  } else if (process.env.ENCRYPTION_KEY.includes('PLEASE_GENERATE')) {
    console.log('  ❌ Encryption key not generated');
    console.log('     → Run: node scripts/generate-encryption-key.js');
    hasErrors = true;
  } else {
    console.log('  ⚠️  Encryption key length is unusual (expected 64 characters)');
    console.log(`     Current length: ${process.env.ENCRYPTION_KEY.length}`);
  }
} else {
  console.log('  ❌ ENCRYPTION_KEY not set');
  hasErrors = true;
}

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log('\n❌ Configuration has errors. Please fix the issues above.\n');
  console.log('📖 See SETUP_INSTRUCTIONS.md for detailed setup guide.\n');
  process.exit(1);
} else {
  console.log('\n✅ Configuration looks good! Ready to start the server.\n');
  console.log('🚀 Run: npm run dev\n');
  process.exit(0);
}

