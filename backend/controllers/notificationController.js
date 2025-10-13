const Notification = require('../models/Notification');

exports.listNotifications = async (req, res) => {
  try {
    const { customerId } = req.params;
    const items = await Notification.find({ to: customerId }).sort('-createdAt');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markSent = async (req, res) => {
  try {
    const { id } = req.params;
    const n = await Notification.findByIdAndUpdate(id, { sent: true }, { new: true });
    res.json(n);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
