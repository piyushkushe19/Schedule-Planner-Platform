const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;

    // Check username uniqueness if being changed
    if (updates.username) {
      const existing = await User.findOne({
        username: updates.username,
        _id: { $ne: req.user._id },
      });
      if (existing) {
        return res.status(409).json({ error: 'Username already taken' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

exports.getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select(
      'name username bio timezone meetingDuration profileImage googleCalendarConnected'
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const Booking = require('../models/Booking');
    const now = new Date();

    const [upcomingCount, totalCount, todayCount] = await Promise.all([
      Booking.countDocuments({
        userId: req.user._id,
        startTime: { $gte: now },
        status: 'confirmed',
      }),
      Booking.countDocuments({
        userId: req.user._id,
        status: 'confirmed',
      }),
      Booking.countDocuments({
        userId: req.user._id,
        startTime: {
          $gte: new Date(now.setHours(0, 0, 0, 0)),
          $lte: new Date(now.setHours(23, 59, 59, 999)),
        },
        status: 'confirmed',
      }),
    ]);

    res.json({ upcomingCount, totalCount, todayCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
