const Availability = require('../models/Availability');

exports.getMyAvailability = async (req, res) => {
  try {
    const availability = await Availability.find({ userId: req.user._id }).sort('dayOfWeek');
    res.json({ availability });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
};

exports.updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;

    const ops = availability.map((item) => ({
      updateOne: {
        filter: { userId: req.user._id, dayOfWeek: item.dayOfWeek },
        update: {
          $set: {
            isActive: item.isActive,
            slots: item.slots,
          },
        },
        upsert: true,
      },
    }));

    await Availability.bulkWrite(ops);

    const updated = await Availability.find({ userId: req.user._id }).sort('dayOfWeek');
    res.json({ message: 'Availability updated', availability: updated });
  } catch (err) {
    console.error('Update availability error:', err);
    res.status(500).json({ error: 'Failed to update availability' });
  }
};

// Get public availability for a user by username (used on booking page)
exports.getPublicAvailability = async (req, res) => {
  try {
    const User = require('../models/User');
    const { username } = req.params;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const availability = await Availability.find({ userId: user._id, isActive: true }).sort('dayOfWeek');
    res.json({ availability, user: { meetingDuration: user.meetingDuration, bufferTime: user.bufferTime, timezone: user.timezone } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch availability' });
  }
};
