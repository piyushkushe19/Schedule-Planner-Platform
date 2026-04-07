const Booking = require('../models/Booking');
const Availability = require('../models/Availability');
const User = require('../models/User');
const { getCalendarClient } = require('../config/google');
const { v4: uuidv4 } = require('uuid');

// Get available slots for a given date and username
exports.getAvailableSlots = async (req, res) => {
  try {
    const { username } = req.params;
    const { date, timezone } = req.query; // date: "2024-01-15", timezone: "America/New_York"

    if (!date) return res.status(400).json({ error: 'Date is required' });

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();

    // Get availability for this day
    const dayAvailability = await Availability.findOne({
      userId: user._id,
      dayOfWeek,
      isActive: true,
    });

    if (!dayAvailability || !dayAvailability.slots.length) {
      return res.json({ slots: [] });
    }

    // Generate time slots
    const duration = user.meetingDuration; // minutes
    const buffer = user.bufferTime; // minutes
    const slots = [];

    for (const slot of dayAvailability.slots) {
      const [startH, startM] = slot.startTime.split(':').map(Number);
      const [endH, endM] = slot.endTime.split(':').map(Number);

      let current = new Date(date);
      current.setHours(startH, startM, 0, 0);

      const end = new Date(date);
      end.setHours(endH, endM, 0, 0);

      while (new Date(current.getTime() + duration * 60000) <= end) {
        const slotStart = new Date(current);
        const slotEnd = new Date(current.getTime() + duration * 60000);

        slots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
        });

        current = new Date(current.getTime() + (duration + buffer) * 60000);
      }
    }

    // Filter out already booked slots
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const existingBookings = await Booking.find({
      userId: user._id,
      status: 'confirmed',
      startTime: { $gte: dayStart, $lte: dayEnd },
    });

    const busyTimes = existingBookings.map((b) => ({
      start: b.startTime,
      end: b.endTime,
    }));

    // If Google Calendar connected, also fetch busy times from Google
    if (user.googleCalendarConnected && user.googleTokens) {
      try {
        const calendar = getCalendarClient(user.googleTokens);
        const freeBusy = await calendar.freebusy.query({
          requestBody: {
            timeMin: dayStart.toISOString(),
            timeMax: dayEnd.toISOString(),
            items: [{ id: 'primary' }],
          },
        });
        const googleBusy = freeBusy.data.calendars.primary?.busy || [];
        busyTimes.push(...googleBusy.map((b) => ({ start: new Date(b.start), end: new Date(b.end) })));
      } catch (gErr) {
        console.warn('Could not fetch Google busy times:', gErr.message);
      }
    }

    // Filter out overlapping slots
    const available = slots.filter((slot) => {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);
      // Also filter past slots
      if (slotStart < new Date()) return false;

      return !busyTimes.some((busy) => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        return slotStart < busyEnd && slotEnd > busyStart;
      });
    });

    res.json({ slots: available });
  } catch (err) {
    console.error('Get slots error:', err);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
};

// Create a booking
exports.createBooking = async (req, res) => {
  try {
    const { username } = req.params;
    const { guestName, guestEmail, startTime, guestTimezone, notes } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const start = new Date(startTime);
    const end = new Date(start.getTime() + user.meetingDuration * 60000);

    // Check for conflicts
    const conflict = await Booking.findOne({
      userId: user._id,
      status: 'confirmed',
      $or: [
        { startTime: { $lt: end, $gte: start } },
        { endTime: { $gt: start, $lte: end } },
      ],
    });

    if (conflict) {
      return res.status(409).json({ error: 'This time slot is no longer available' });
    }

    let meetingDescription = notes || '';
    let googleEventId = null;

    // Create Google Calendar event if connected
    if (user.googleCalendarConnected && user.googleTokens) {
      try {
        const calendar = getCalendarClient(user.googleTokens);
        const event = {
          summary: `Meeting with ${guestName}`,
          description: meetingDescription || `Scheduled via Schedulr`,
          start: { dateTime: start.toISOString(), timeZone: user.timezone },
          end: { dateTime: end.toISOString(), timeZone: user.timezone },
          attendees: [{ email: guestEmail }],
          reminders: {
            useDefault: false,
            overrides: [
              { method: 'email', minutes: 24 * 60 },
              { method: 'popup', minutes: 10 },
            ],
          },
        };

        const createdEvent = await calendar.events.insert({
          calendarId: 'primary',
          sendUpdates: 'all',
          requestBody: event,
        });

        googleEventId = createdEvent.data.id;
      } catch (gErr) {
        console.warn('Failed to create Google event:', gErr.message);
      }
    }

    const cancelToken = uuidv4();

    const booking = new Booking({
      userId: user._id,
      guestName,
      guestEmail,
      guestTimezone: guestTimezone || 'UTC',
      startTime: start,
      endTime: end,
      notes: meetingDescription,
      googleEventId,
      cancelToken,
      status: 'confirmed',
    });

    await booking.save();

    res.status(201).json({
      message: 'Booking confirmed!',
      booking: {
        id: booking._id,
        guestName: booking.guestName,
        startTime: booking.startTime,
        endTime: booking.endTime,
        hostName: user.name,
        duration: user.meetingDuration,
        cancelToken,
      },
    });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

// Get my bookings (host view)
exports.getMyBookings = async (req, res) => {
  try {
    const { status, from, to } = req.query;
    const filter = { userId: req.user._id };

    if (status) filter.status = status;
    if (from || to) {
      filter.startTime = {};
      if (from) filter.startTime.$gte = new Date(from);
      if (to) filter.startTime.$lte = new Date(to);
    }

    const bookings = await Booking.find(filter).sort({ startTime: 1 }).limit(100);
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelToken } = req.query;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    // Either host or cancel token holder can cancel
    const isHost = req.user && booking.userId.toString() === req.user._id.toString();
    const hasToken = cancelToken && booking.cancelToken === cancelToken;

    if (!isHost && !hasToken) {
      return res.status(403).json({ error: 'Unauthorized to cancel this booking' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Cancel Google Calendar event if exists
    if (booking.googleEventId) {
      try {
        const user = await User.findById(booking.userId);
        if (user?.googleTokens) {
          const calendar = getCalendarClient(user.googleTokens);
          await calendar.events.delete({
            calendarId: 'primary',
            eventId: booking.googleEventId,
            sendUpdates: 'all',
          });
        }
      } catch (gErr) {
        console.warn('Failed to delete Google event:', gErr.message);
      }
    }

    res.json({ message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
};
