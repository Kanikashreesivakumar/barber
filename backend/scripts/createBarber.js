const mongoose = require('mongoose');
const Barber = require('../models/Barber');
require('dotenv').config();

async function createBarber() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/barbershop');
    console.log('Connected to MongoDB');

    const email = 'kanikashreesivakumar16@gmail.com';
    
    // Check if barber already exists
    const existing = await Barber.findOne({ email });
    if (existing) {
      console.log('Barber already exists:', existing);
      process.exit(0);
    }

    // Create new barber
    const barber = new Barber({
      name: 'Kanika Shree Sivakumar',
      email: email,
      phone: '1234567890',
      shopName: 'Premium Barber Shop'
    });

    await barber.save();
    console.log('✅ Barber created successfully in MongoDB:', barber);
    console.log('\nBarber ID:', barber._id);
    console.log('Email:', barber.email);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating barber:', error);
    process.exit(1);
  }
}

createBarber();
