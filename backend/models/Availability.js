const mongoose = require('mongoose');

const timeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // "09:00"
  endTime: { type: String, required: true },   // "17:00"
}, { _id: false });

const availabilitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0, // 0 = Sunday
    max: 6, // 6 = Saturday
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  slots: [timeSlotSchema],
}, {
  timestamps: true,
});

// Compound index to ensure one entry per user per day
availabilitySchema.index({ userId: 1, dayOfWeek: 1 }, { unique: true });

module.exports = mongoose.model('Availability', availabilitySchema);
