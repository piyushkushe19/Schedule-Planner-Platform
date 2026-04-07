const { createOAuthClient, getAuthUrl, getCalendarClient } = require('../config/google');
const User = require('../models/User');

exports.getAuthUrl = async (req, res) => {
  try {
    const oAuth2Client = createOAuthClient();
    const url = getAuthUrl(oAuth2Client);
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
};

exports.handleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) return res.status(400).json({ error: 'Authorization code missing' });

    const oAuth2Client = createOAuthClient();
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Update user with tokens
    await User.findByIdAndUpdate(req.user._id, {
      googleTokens: tokens,
      googleCalendarConnected: true,
    });

    // Redirect to frontend with success
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?calendar=connected`);
  } catch (err) {
    console.error('Calendar callback error:', err);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?calendar=error`);
  }
};

exports.disconnect = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      googleTokens: null,
      googleCalendarConnected: false,
    });
    res.json({ message: 'Google Calendar disconnected' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to disconnect' });
  }
};

exports.getUpcomingEvents = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user.googleCalendarConnected || !user.googleTokens) {
      return res.status(400).json({ error: 'Google Calendar not connected' });
    }

    const calendar = getCalendarClient(user.googleTokens);
    const now = new Date();
    const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const events = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: oneWeek.toISOString(),
      maxResults: 20,
      singleEvents: true,
      orderBy: 'startTime',
    });

    res.json({ events: events.data.items });
  } catch (err) {
    console.error('Get events error:', err);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
};
