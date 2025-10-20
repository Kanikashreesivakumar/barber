/**
 * Complete setup script for Barber Booking Backend
 * This script will:
 * 1. Connect to MongoDB
 * 2. Seed services
 * 3. Seed barbers
 * 4. Verify the data
 */

const mongoose = require('mongoose');
const Service = require('./models/Service');
const Barber = require('./models/Barber');
require('dotenv').config();

// Sample services
const services = [
  { name: 'Haircut', description: 'Professional haircut with styling', duration_minutes: 30, price: 350 },
  { name: 'Beard Trim', description: 'Precision beard trimming and shaping', duration_minutes: 15, price: 300 },
  { name: 'Hair & Beard Combo', description: 'Complete haircut and beard service', duration_minutes: 45, price: 550 },
  { name: 'Hot Towel Shave', description: 'Traditional hot towel shave experience', duration_minutes: 30, price: 400 },
  { name: 'Kids Haircut', description: 'Haircut for children under 12', duration_minutes: 20, price: 300 },
  { name: 'Hair Coloring', description: 'Professional hair coloring service', duration_minutes: 60, price: 700 }
];

// Sample barbers
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

async function setup() {
  try {
    console.log('🚀 Starting Barber Booking Backend Setup...\n');

    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/barbershop';
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Seed Services
    console.log('📦 Seeding Services...');
    let servicesCreated = 0;
    let servicesSkipped = 0;

    for (const serviceData of services) {
      const existing = await Service.findOne({ name: serviceData.name });
      if (existing) {
        console.log(`   ⏭️  Skipped: ${serviceData.name} (already exists)`);
        servicesSkipped++;
      } else {
        const service = new Service(serviceData);
        await service.save();
        console.log(`   ✅ Created: ${service.name} - $${service.price} (${service.duration_minutes}m)`);
        servicesCreated++;
      }
    }

    console.log(`\n📊 Services Summary: ${servicesCreated} created, ${servicesSkipped} skipped\n`);

    // Seed Barbers
    console.log('👨‍💼 Seeding Barbers...');
    let barbersCreated = 0;
    let barbersSkipped = 0;

    for (const barberData of barbers) {
      const existing = await Barber.findOne({ email: barberData.email });
      if (existing) {
        console.log(`   ⏭️  Skipped: ${barberData.name} (already exists)`);
        barbersSkipped++;
      } else {
        const barber = new Barber(barberData);
        await barber.save();
        console.log(`   ✅ Created: ${barber.name} - ${barber.shopName}`);
        barbersCreated++;
      }
    }

    console.log(`\n📊 Barbers Summary: ${barbersCreated} created, ${barbersSkipped} skipped\n`);

    // Verify Data
    console.log('🔍 Verifying Database...');
    const totalServices = await Service.countDocuments();
    const totalBarbers = await Barber.countDocuments();

    console.log(`   📋 Total Services: ${totalServices}`);
    console.log(`   👥 Total Barbers: ${totalBarbers}\n`);

    // Display all data
    console.log('📋 All Services:');
    const allServices = await Service.find();
    allServices.forEach(s => {
      console.log(`   - ${s.name}: $${s.price} (${s.duration_minutes} min)`);
    });

    console.log('\n👥 All Barbers:');
    const allBarbers = await Barber.find();
    allBarbers.forEach(b => {
      console.log(`   - ${b.name} (${b.email}) - ${b.shopName} - ⭐${b.rating}`);
    });

    console.log('\n✅ Setup completed successfully!');
    console.log('\n🚀 You can now start the server with: node server.js\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

setup();
