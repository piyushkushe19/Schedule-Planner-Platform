const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Availability = require('../models/Availability');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Default availability: Mon-Fri, 9am-5pm
const createDefaultAvailability = async (userId) => {
  const defaults = [1, 2, 3, 4, 5].map((day) => ({
    userId,
    dayOfWeek: day,
    isActive: true,
    slots: [{ startTime: '09:00', endTime: '17:00' }],
  }));

  const weekends = [0, 6].map((day) => ({
    userId,
    dayOfWeek: day,
    isActive: false,
    slots: [],
  }));

  await Availability.insertMany([...defaults, ...weekends]);
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, timezone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = new User({ name, email, password, timezone: timezone || 'UTC' });
    await user.save();

    // Create default availability
    await createDefaultAvailability(user._id);

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};
