const Barber = require('../models/Barber');

exports.getBarbers = async (req, res) => {
  try {
    const barbers = await Barber.find();
    res.json(barbers);
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
