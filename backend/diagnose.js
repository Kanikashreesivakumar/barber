/**
 * Quick Diagnostic & Fix Script
 * Run this to identify and fix backend issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Running Backend Diagnostics...\n');

// Check 1: Required files exist
console.log('📁 Checking required files...');
const requiredFiles = [
  'server.js',
  'package.json',
  'config/db.js',
  'models/Service.js',
  'models/Barber.js',
  'routes/serviceRoutes.js',
  'routes/barberRoutes.js',
  'controllers/serviceController.js',
  'controllers/barberController.js'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING!`);
    allFilesExist = false;
  }
});

// Check 2: node_modules
console.log('\n📦 Checking dependencies...');
if (fs.existsSync('node_modules')) {
  console.log('   ✅ node_modules exists');
} else {
  console.log('   ❌ node_modules missing - run: npm install');
  allFilesExist = false;
}

// Check 3: .env file
console.log('\n⚙️  Checking configuration...');
if (fs.existsSync('.env')) {
  console.log('   ✅ .env exists');
  const envContent = fs.readFileSync('.env', 'utf8');
  if (envContent.includes('MONGO_URI')) {
    console.log('   ✅ MONGO_URI is set');
  } else {
    console.log('   ⚠️  MONGO_URI not found in .env');
  }
} else {
  console.log('   ❌ .env missing - creating default...');
  const defaultEnv = `# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/barbershop

# Server Port
PORT=5000

# Environment
NODE_ENV=development
`;
  fs.writeFileSync('.env', defaultEnv);
  console.log('   ✅ Created .env with defaults');
}

console.log('\n📊 Diagnostic Summary:');
if (allFilesExist) {
  console.log('   ✅ All required files present');
  console.log('\n🚀 Next Steps:');
  console.log('   1. Run: npm install (if not done)');
  console.log('   2. Run: node start.js (will auto-seed if needed)');
  console.log('   3. Server will start on http://localhost:5000');
  console.log('\n📝 API Endpoints:');
  console.log('   - GET  http://localhost:5000/api/services');
  console.log('   - GET  http://localhost:5000/api/barbers');
  console.log('   - POST http://localhost:5000/api/bookings');
} else {
  console.log('   ❌ Some files are missing!');
  console.log('\n🔧 Please check the missing files above');
}

console.log('');
