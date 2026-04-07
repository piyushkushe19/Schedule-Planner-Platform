# 🚀 Schedulr — Intelligent Meeting Scheduling Platform

Schedulr is a **full-stack, production-ready scheduling platform** inspired by tools like Calendly, designed to simplify meeting coordination with **real-time availability, Google Calendar integration, and AI-powered enhancements**.

---

## ✨ Features

### 🔐 Authentication & User Management
- JWT-based authentication (secure & stateless)
- User profiles with timezone support
- Public booking pages (`/book/:username`)

### 📅 Scheduling System
- Custom weekly availability
- Dynamic slot generation (no pre-storage)
- Buffer time between meetings
- Prevents double bookings (DB-level checks)

### 🔗 Booking Flow
- Shareable booking link
- Guest booking without account
- Email-based identification
- UUID-based cancellation (no login required)

### 📆 Google Calendar Integration
- OAuth2 authentication
- Automatic event creation
- Guest invitations via email
- Sync with real-time availability

### 🤖 AI Enhancements (Optional)
Powered by OpenAI:
- Smart time slot recommendations
- AI-generated meeting descriptions

### 🛡️ Security
- Password hashing using bcrypt
- API rate limiting
- Input validation with Joi
- Secure token handling (server-side)

---

## 🏗️ Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- React Router DOM
- Axios

### Backend
- Node.js + Express
- MongoDB (Mongoose)
- JWT Authentication
- Google Calendar API

### Dev Tools & APIs
- OpenAI API (optional)
- date-fns-tz
- Nodemon

---

## 🧠 Architecture Overview


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
