# Schedulr — Full-Stack Scheduling Platform

A production-ready Calendly-style meeting scheduler built with React, Node.js, MongoDB, Google Calendar API, and OpenAI.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        BROWSER                          │
│  React (Vite) + Tailwind CSS + React Router DOM         │
│  Axios → /api proxy → Express backend                   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP / JSON
┌──────────────────────▼──────────────────────────────────┐
│                   EXPRESS API (Node.js)                  │
│  JWT Auth  │  Rate Limiting  │  Joi Validation          │
│  Routes: /auth /users /availability /bookings /calendar │
└─────┬───────────────┬────────────────────┬──────────────┘
      │               │                    │
   MongoDB       Google Calendar        OpenAI API
   (Mongoose)    OAuth2 + Events        (GPT-3.5)
```

### Request Flow
1. User registers → JWT issued → stored in localStorage
2. User sets availability → saved to MongoDB
3. User shares `/book/:username` link
4. Guest visits link → slots computed from availability − busy times
5. Guest selects slot → booking created in MongoDB
6. If Google Calendar connected → event created, guest invited via email
7. AI optionally suggests best slots (OpenAI) and generates meeting descriptions

---

## 📁 Project Structure

```
schedulr/
├── backend/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── google.js            # Google OAuth2 client factory
│   ├── controllers/
│   │   ├── authController.js    # Register, login, me
│   │   ├── userController.js    # Profile update, public profile, stats
│   │   ├── availabilityController.js
│   │   ├── bookingController.js # Slot generation, booking, cancel
│   │   ├── calendarController.js# Google OAuth2 flow
│   │   └── aiController.js      # OpenAI description + suggestions
│   ├── middleware/
│   │   ├── auth.js              # JWT validation
│   │   └── validate.js          # Joi schemas + validate()
│   ├── models/
│   │   ├── User.js
│   │   ├── Availability.js
│   │   └── Booking.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── availability.js
│   │   ├── bookings.js
│   │   ├── calendar.js
│   │   └── ai.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Alert.jsx
    │   │   │   ├── CopyButton.jsx
    │   │   │   ├── EmptyState.jsx
    │   │   │   ├── Modal.jsx
    │   │   │   ├── ProtectedRoute.jsx
    │   │   │   └── Spinner.jsx
    │   │   └── layout/
    │   │       └── DashboardLayout.jsx
    │   ├── hooks/
    │   │   └── useAuth.jsx         # Auth context + provider
    │   ├── pages/
    │   │   ├── LandingPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── RegisterPage.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── AvailabilityPage.jsx
    │   │   ├── BookingsPage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── BookingPage.jsx      # Public — /book/:username
    │   │   ├── BookingConfirmPage.jsx
    │   │   └── NotFoundPage.jsx
    │   ├── services/
    │   │   ├── api.js               # Axios instance + interceptors
    │   │   ├── bookingService.js
    │   │   └── availabilityService.js
    │   ├── utils/
    │   │   ├── timezone.js          # date-fns-tz helpers + TIMEZONES list
    │   │   └── helpers.js
    │   ├── App.jsx
    │   ├── main.jsx
    │   └── index.css                # Tailwind + component classes
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── vercel.json
    └── .env.example
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Google Cloud project with Calendar API enabled
- OpenAI API key (optional — AI features degrade gracefully)

### 1. Clone & install

```bash
git clone <your-repo>
cd schedulr

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/schedulr
JWT_SECRET=some_long_random_string_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173

GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/callback

OPENAI_API_KEY=sk-...   # optional
```

### 3. Configure frontend

```bash
cd frontend
cp .env.example .env
# .env already has VITE_API_URL=/api (works via Vite proxy)
```

### 4. Run development servers

```bash
# Terminal 1 — backend
cd backend
npm run dev     # nodemon, port 5000

# Terminal 2 — frontend
cd frontend
npm run dev     # Vite, port 5173
```

Open http://localhost:5173

---

## 🔑 Google Calendar Setup

1. Go to https://console.cloud.google.com
2. Create a new project (or use existing)
3. Enable **Google Calendar API** (APIs & Services → Enable APIs)
4. Create **OAuth 2.0 credentials**:
   - Application type: **Web application**
   - Authorised redirect URIs: `http://localhost:5000/api/calendar/callback`
   - For production: `https://your-backend.onrender.com/api/calendar/callback`
5. Copy **Client ID** and **Client Secret** to backend `.env`
6. In OAuth consent screen → add your email as test user (while in testing mode)

---

## 🤖 AI Features (OpenAI)

Two AI features powered by GPT-3.5:

### 1. Best time suggestions
- On the booking page, after slots load, a background call suggests the top 3 best slots
- Considers time of day, day of week, and meeting purpose
- Displayed as highlighted recommendations with reasoning

### 2. Meeting description generator
- On booking creation, AI can auto-generate a professional meeting description
- Used as the Google Calendar event body
- Activated via `POST /api/ai/generate-description`

Both features **gracefully degrade** if `OPENAI_API_KEY` is not set — the platform works fully without them.

---

## 🗄️ Database Schema

### User
```
name, email, password (bcrypt), username, timezone,
bio, googleTokens, googleCalendarConnected,
meetingDuration, bufferTime, profileImage
```

### Availability
```
userId (ref), dayOfWeek (0-6), isActive,
slots: [{ startTime: "09:00", endTime: "17:00" }]
Compound index: userId + dayOfWeek (unique)
```

### Booking
```
userId (ref), guestName, guestEmail, guestTimezone,
startTime, endTime, notes, googleEventId,
meetingDescription, status (confirmed|cancelled|pending),
cancelToken (UUID for guest self-cancel)
```

---

## 🔐 Security

| Feature | Implementation |
|---|---|
| Password hashing | bcrypt, 12 rounds |
| Auth tokens | JWT, 7-day expiry, signed with secret |
| Route protection | authenticate middleware on all private routes |
| Input validation | Joi schemas on every POST/PUT endpoint |
| Rate limiting | 100 req/15min global; 20 req/15min on /auth |
| CORS | Restricted to FRONTEND_URL origin |
| Google tokens | Never sent to client; server-only |
| Double booking | DB conflict check before every booking |
| Guest cancel | UUID cancel token (no account needed) |

---

## 🚀 Deployment

### Backend → Render.com

1. Push code to GitHub
2. Create new **Web Service** on Render
3. Connect your repo
4. Settings:
   - **Build command**: `cd backend && npm install`
   - **Start command**: `cd backend && node server.js`
5. Add all environment variables from `.env`
6. Update `GOOGLE_REDIRECT_URI` to: `https://your-service.onrender.com/api/calendar/callback`

### Frontend → Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set **Root Directory**: `frontend`
4. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
5. Edit `vercel.json` — replace `YOUR-BACKEND-URL` with your Render URL
6. Deploy

### Post-deployment checklist
- [ ] Update `FRONTEND_URL` in backend env to your Vercel URL
- [ ] Update `GOOGLE_REDIRECT_URI` to production backend URL
- [ ] Add production redirect URI in Google Cloud Console
- [ ] Test the full booking flow end-to-end
- [ ] Verify Google Calendar sync works
- [ ] Check AI suggestions load (or confirm they fail gracefully)

---

## 📡 API Reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | — | Create account |
| POST | /api/auth/login | — | Login, get JWT |
| GET | /api/auth/me | ✓ | Get current user |
| PUT | /api/users/profile | ✓ | Update profile |
| GET | /api/users/stats | ✓ | Dashboard stats |
| GET | /api/users/:username | — | Public profile |
| GET | /api/availability/me | ✓ | Get my availability |
| PUT | /api/availability/me | ✓ | Update availability |
| GET | /api/availability/public/:username | — | Public availability |
| GET | /api/bookings/slots/:username | — | Available slots for date |
| POST | /api/bookings/book/:username | — | Create booking |
| GET | /api/bookings/mine | ✓ | My bookings |
| PATCH | /api/bookings/:id/cancel | — | Cancel booking |
| GET | /api/calendar/auth-url | ✓ | Start Google OAuth |
| GET | /api/calendar/callback | ✓ | OAuth callback |
| DELETE | /api/calendar/disconnect | ✓ | Disconnect Google |
| GET | /api/calendar/events | ✓ | Upcoming calendar events |
| POST | /api/ai/suggest-times | — | AI slot suggestions |
| POST | /api/ai/generate-description | — | AI meeting description |

---

## 🧪 Testing the Booking Flow

1. Register at `/register`
2. Set availability at `/availability`
3. Copy booking link from `/dashboard`
4. Open booking link in incognito: `/book/:username`
5. Select a date → pick a time slot
6. Enter name + email → confirm booking
7. Check `/bookings` to see the new booking
8. If Google Calendar connected, check your Google Calendar

---

## 🔧 Troubleshooting

**"Cannot connect to MongoDB"**
→ Check `MONGODB_URI` format; ensure IP `0.0.0.0/0` is whitelisted in Atlas Network Access

**"Google OAuth redirect_uri_mismatch"**
→ The redirect URI in `.env` must exactly match what's in Google Cloud Console

**"No available slots"**
→ Check that availability days are toggled ON and time ranges are valid (start < end)

**AI suggestions not showing**
→ Expected if `OPENAI_API_KEY` is not set — the UI silently hides the AI section

**JWT errors after deployment**
→ Ensure `JWT_SECRET` is set in the hosting environment (not just local `.env`)

---

## 🤝 Assumptions & Decisions

| Decision | Rationale |
|---|---|
| Slots computed on-demand | Avoids pre-generating millions of slots in DB |
| JWT in localStorage | Simpler SPA integration; use httpOnly cookies for higher security |
| `cancelToken` UUID | Guests can cancel without needing an account |
| Bulk write for availability | Atomic upsert for all 7 days in one DB call |
| AI degrades gracefully | Platform is fully functional without OpenAI key |
| `date-fns-tz` for formatting | Reliable IANA timezone support, smaller bundle than moment |
| Google tokens stored server-side | Never exposed to the browser |
| Buffer time applied to slot generation | Prevents back-to-back meetings at generation time |
| Conflict check before booking | Last-mile guard against race conditions |
