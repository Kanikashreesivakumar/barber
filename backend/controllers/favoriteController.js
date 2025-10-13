const Favorite = require('../models/Favorite');

exports.listFavorites = async (req, res) => {
  try {
    const { customerId } = req.params;
    const favs = await Favorite.find({ customerId }).populate('barber');
    res.json(favs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const { customerId, barber } = req.body;
    const existing = await Favorite.findOne({ customerId, barber });
    if (existing) return res.status(200).json(existing);
    const fav = new Favorite({ customerId, barber });
    await fav.save();
    res.status(201).json(fav);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    await Favorite.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
