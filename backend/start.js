/**
 * Smart startup script for Barber Backend
 * This will:
 * 1. Check MongoDB connection
 * 2. Check if collections are empty
 * 3. Offer to seed data if empty
 * 4. Start the server
 */

const mongoose = require('mongoose');
const readline = require('readline');
require('dotenv').config();

const Service = require('./models/Service');
const Barber = require('./models/Barber');

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/barbershop';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function checkAndSetup() {
  try {
    console.log('🚀 Barber Backend Startup\n');
    
    // Step 1: Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully\n');

    // Step 2: Check collections
    const serviceCount = await Service.countDocuments();
    const barberCount = await Barber.countDocuments();

    console.log('📊 Database Status:');
    console.log(`   - Services: ${serviceCount}`);
    console.log(`   - Barbers: ${barberCount}\n`);

    // Step 3: Offer to seed if empty
    if (serviceCount === 0 || barberCount === 0) {
      console.log('⚠️  Database is empty or missing data!');
      console.log('\n🔧 Would you like to seed the database now? (y/n)');
      
      rl.question('> ', async (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          console.log('\n📦 Seeding database...\n');
          await seedDatabase();
          console.log('\n✅ Database seeded successfully!\n');
        } else {
          console.log('\n⏭️  Skipping seed. You can run "node setup.js" later.\n');
        }
        
        rl.close();
        await mongoose.connection.close();
        
        // Step 4: Start the server
        console.log('🚀 Starting server...\n');
        require('./server.js');
      });
    } else {
      console.log('✅ Database has data, ready to go!\n');
      rl.close();
      await mongoose.connection.close();
      
      // Start the server
      console.log('🚀 Starting server...\n');
      require('./server.js');
    }
    
  } catch (error) {
    console.error('❌ Startup failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Is MongoDB running? Run: mongod');
    console.error('   2. Check your .env file has MONGO_URI set');
    console.error('   3. Default: mongodb://localhost:27017/barbershop\n');
    process.exit(1);
  }
}

async function seedDatabase() {
  // Seed Services
  const services = [
    { name: 'Haircut', description: 'Professional haircut with styling', duration_minutes: 30, price: 350 },
    { name: 'Beard Trim', description: 'Precision beard trimming and shaping', duration_minutes: 15, price: 300 },
    { name: 'Hair & Beard Combo', description: 'Complete haircut and beard service', duration_minutes: 45, price: 550 },
    { name: 'Hot Towel Shave', description: 'Traditional hot towel shave experience', duration_minutes: 30, price: 400 },
    { name: 'Kids Haircut', description: 'Haircut for children under 12', duration_minutes: 20, price: 300 },
    { name: 'Hair Coloring', description: 'Professional hair coloring service', duration_minutes: 60, price: 700 }
  ];

  for (const serviceData of services) {
    const existing = await Service.findOne({ name: serviceData.name });
    if (!existing) {
      const service = new Service(serviceData);
      await service.save();
      console.log(`   ✅ Created service: ${service.name}`);
    }
  }

  // Seed Barbers
  const barbers = [
    {
      name: 'John Smith',
      email: 'john@barbershop.com',
      phone: '555-0101',
      shopName: "John's Classic Cuts",
      specialization: 'Classic Haircuts',
      rating: 4.8,
      experienceYears: 10
    },
    {
      name: 'Mike Johnson',
      email: 'mike@barbershop.com',
      phone: '555-0102',
      shopName: "Mike's Modern Style",
      specialization: 'Modern Styles',
      rating: 4.9,
      experienceYears: 8
    },
    {
      name: 'Carlos Rodriguez',
      email: 'carlos@barbershop.com',
      phone: '555-0103',
      shopName: "Carlos' Fade Masters",
      specialization: 'Fades & Tapers',
      rating: 4.7,
      experienceYears: 12
    },
    {
      name: 'David Lee',
      email: 'david@barbershop.com',
      phone: '555-0104',
      shopName: "David's Beard Studio",
      specialization: 'Beard Grooming',
      rating: 4.9,
      experienceYears: 7
    }
  ];

  for (const barberData of barbers) {
    const existing = await Barber.findOne({ email: barberData.email });
    if (!existing) {
      const barber = new Barber(barberData);
      await barber.save();
      console.log(`   ✅ Created barber: ${barber.name}`);
    }
  }
}

// Run the startup check
checkAndSetup();
