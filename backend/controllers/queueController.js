const QueueEntry = require('../models/QueueEntry');


exports.getQueueForBarber = async (req, res) => {
  try {
    const barberId = req.params.barberId;
    const entries = await QueueEntry.find({ barber: barberId, status: 'waiting' }).sort('joinedAt');
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllQueues = async (req, res) => {
  try {
    const entries = await QueueEntry.find().sort('-joinedAt').populate('barber');
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.joinQueue = async (req, res) => {
  try {
    const { barber, customerName, customerPhone } = req.body;
    const entry = new QueueEntry({ barber, customerName, customerPhone });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.leaveQueue = async (req, res) => {
  try {
    const entryId = req.params.id;
    const entry = await QueueEntry.findByIdAndUpdate(entryId, { status: 'cancelled' }, { new: true });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
