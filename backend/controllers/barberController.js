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
    const barber = await Barber.findOne({ email: decodeURIComponent(email) });
    
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
