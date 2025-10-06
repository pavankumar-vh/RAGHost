/**
 * Generate a secure encryption key for API key encryption
 * Run: node scripts/generate-encryption-key.js
 */

import crypto from 'crypto';

console.log('\n🔐 Generating 256-bit encryption key...\n');
const key = crypto.randomBytes(32).toString('hex');
console.log('Copy this key to your .env file as ENCRYPTION_KEY:\n');
console.log(key);
console.log('\n⚠️  Keep this key secret! Do not commit it to Git.\n');

