const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name too long'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password too short'],
    select: false,
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  timezone: {
    type: String,
    default: 'UTC',
  },
  bio: {
    type: String,
    maxlength: [300, 'Bio too long'],
    default: '',
  },
  googleTokens: {
    access_token: String,
    refresh_token: String,
    scope: String,
    token_type: String,
    expiry_date: Number,
  },
  googleCalendarConnected: {
    type: Boolean,
    default: false,
  },
  meetingDuration: {
    type: Number,
    default: 30, // minutes
  },
  bufferTime: {
    type: Number,
    default: 0, // minutes between meetings
  },
  profileImage: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Auto-generate username from email if not set
userSchema.pre('save', function (next) {
  if (!this.username && this.email) {
    this.username = this.email.split('@')[0].replace(/[^a-z0-9]/gi, '').toLowerCase();
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.googleTokens;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
