const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  guestName: {
    type: String,
    required: true,
    trim: true,
  },
  guestEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  guestTimezone: {
    type: String,
    default: 'UTC',
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
    maxlength: 500,
    default: '',
  },
  googleEventId: {
    type: String,
    default: null,
  },
  meetingDescription: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'pending'],
    default: 'confirmed',
  },
  cancelToken: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
});

bookingSchema.index({ userId: 1, startTime: 1 });
bookingSchema.index({ guestEmail: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
