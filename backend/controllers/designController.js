const Design = require('../models/Design');

exports.getDesigns = async (req, res) => {
  try {
    const designs = await Design.find().populate('barber');
    res.json(designs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createDesign = async (req, res) => {
  try {
    const design = new Design(req.body);
    await design.save();
    res.status(201).json(design);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
