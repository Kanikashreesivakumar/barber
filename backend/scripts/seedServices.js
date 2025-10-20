const mongoose = require('mongoose');
const Service = require('../models/Service');
require('dotenv').config();

// Sample services
const services = [
  {
    name: 'Haircut',
    description: 'Professional haircut with styling',
    duration_minutes: 30,
    price: 350
  },
  {
    name: 'Beard Trim',
    description: 'Precision beard trimming and shaping',
    duration_minutes: 15,
    price: 300
  },
  {
    name: 'Hair & Beard Combo',
    description: 'Complete haircut and beard service',
    duration_minutes: 45,
    price: 550
  },
  {
    name: 'Hot Towel Shave',
    description: 'Traditional hot towel shave experience',
    duration_minutes: 30,
    price: 400
  },
  {
    name: 'Kids Haircut',
    description: 'Haircut for children under 12',
    duration_minutes: 20,
    price: 300
  },
  {
    name: 'Hair Coloring',
    description: 'Professional hair coloring service',
    duration_minutes: 60,
    price: 700
  }
];

async function seedServices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/barbershop');
    console.log('✅ Connected to MongoDB\n');

    // Clear existing services (optional - comment out if you want to keep existing)
    // await Service.deleteMany({});
    // console.log('🗑️  Cleared existing services\n');

    let created = 0;
    let skipped = 0;

    for (const serviceData of services) {
      // Check if service already exists
      const existing = await Service.findOne({ name: serviceData.name });
      
      if (existing) {
        console.log(`⏭️  Skipped (already exists): ${serviceData.name}`);
        skipped++;
      } else {
        // Create new service
        const service = new Service(serviceData);
        await service.save();
        console.log(`✅ Created: ${service.name} - $${service.price} (${service.duration_minutes}m)`);
        created++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   - Created: ${created} service(s)`);
    console.log(`   - Skipped: ${skipped} service(s)`);
    console.log(`   - Total: ${services.length} service(s)\n`);

    // Display all services in database
    const allServices = await Service.find();
    console.log(`📋 All Services in Database (${allServices.length}):`);
    allServices.forEach(s => {
      console.log(`   - ${s.name}: $${s.price} (${s.duration_minutes} min) - ${s.description}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding services:', error);
    process.exit(1);
  }
}

seedServices();
