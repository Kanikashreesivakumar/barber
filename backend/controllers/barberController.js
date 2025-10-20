const Barber = require('../models/Barber');

exports.getBarbers = async (req, res) => {
  try {
    const barbers = await Barber.find();
    res.json(barbers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBarberByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const normalized = decodeURIComponent(email).toLowerCase();
    const barber = await Barber.findOne({ email: normalized });
    
    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' });
    }
    
    res.json(barber);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createBarber = async (req, res) => {
  try {
    const barber = new Barber(req.body);
    await barber.save();
    res.status(201).json(barber);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Create or update a barber by email (upsert)
exports.upsertBarberByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const update = req.body || {};
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const normalized = decodeURIComponent(email).toLowerCase();
    const barber = await Barber.findOneAndUpdate(
      { email: normalized },
      { $set: { email: normalized, ...update } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.json(barber);
  } catch (err) {
    console.error('upsertBarberByEmail error:', err);
    res.status(400).json({ message: err.message });
  }
};

// Update barber by id
exports.updateBarberById = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body || {};
    const barber = await Barber.findByIdAndUpdate(id, update, { new: true });
    if (!barber) return res.status(404).json({ message: 'Barber not found' });
    res.json(barber);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
