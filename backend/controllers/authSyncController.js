const Barber = require('../models/Barber');

// Sync barber profile from Supabase to MongoDB
exports.syncBarberProfile = async (req, res) => {
  try {
    const { email, name, phone, shopName } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if barber already exists
    let barber = await Barber.findOne({ email });

    if (barber) {
      // Update existing barber
      barber.name = name || barber.name;
      barber.phone = phone || barber.phone;
      barber.shopName = shopName || barber.shopName;
      await barber.save();
      console.log('✅ Updated existing barber in MongoDB:', barber);
      return res.json({ message: 'Barber profile updated', barber });
    } else {
      // Create new barber
      barber = new Barber({
        name: name || email.split('@')[0], // Use email username if name not provided
        email,
        phone: phone || '',
        shopName: shopName || 'Barber Shop'
      });
      await barber.save();
      console.log('✅ Created new barber in MongoDB:', barber);
      return res.status(201).json({ message: 'Barber profile created', barber });
    }
  } catch (err) {
    console.error('❌ Error syncing barber profile:', err);
    res.status(500).json({ message: err.message });
  }
};
