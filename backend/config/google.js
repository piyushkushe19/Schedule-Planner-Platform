const { google } = require('googleapis');

const createOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

const getAuthUrl = (oAuth2Client) => {
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
};

const getCalendarClient = (tokens) => {
  const oAuth2Client = createOAuthClient();
  oAuth2Client.setCredentials(tokens);
  return google.calendar({ version: 'v3', auth: oAuth2Client });
};

module.exports = { createOAuthClient, getAuthUrl, getCalendarClient };
