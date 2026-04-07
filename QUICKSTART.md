# Schedulr — Quick Start Guide

## Prerequisites
- Node.js 18+ 
- npm 9+
- MongoDB Atlas account (free)
- Google Cloud account (for Calendar OAuth)

---

## 1. Frontend Setup (runs without backend)

```bash
cd schedulr/frontend
npm install
npm run dev
```
Open **http://localhost:5173** — the landing page appears immediately.

> The frontend works even without a backend. Login/register will fail gracefully,
> but the landing page, booking page design, and public routes all render fine.

---

## 2. Backend Setup

```bash
cd schedulr/backend
npm install
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/schedulr
JWT_SECRET=any_long_random_string_here_at_least_32_chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173

# Google Calendar (see step 3)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_REDIRECT_URI=http://localhost:5000/api/calendar/callback

# Optional — AI features work without this
OPENAI_API_KEY=sk-xxx
```

Start the backend:
```bash
npm run dev
```

---

## 3. Google Calendar OAuth Setup

1. Go to https://console.cloud.google.com
2. Create project → **APIs & Services** → **Enable APIs**
3. Search for **Google Calendar API** → Enable
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized redirect URIs: `http://localhost:5000/api/calendar/callback`
7. Copy **Client ID** and **Client Secret** → paste into `.env`
8. **OAuth consent screen** → add your email as test user

---

## 4. MongoDB Setup

1. Go to https://cloud.mongodb.com
2. Create free cluster (M0)
3. Database Access → Add user with password
4. Network Access → Add IP `0.0.0.0/0` (allow all)
5. Connect → Drivers → copy connection string
6. Replace `<password>` and paste into `MONGODB_URI` in `.env`

---

## 5. Test the Full Flow

1. Register at http://localhost:5173/register
2. Set availability at http://localhost:5173/availability
3. Copy booking link from dashboard
4. Open link in incognito: http://localhost:5173/book/yourusername
5. Select a date → pick a slot → fill in details → confirm
6. Check http://localhost:5173/bookings to see the booking

---

## Troubleshooting

| Problem | Solution |
|---|---|
| Blank white screen | Run `npm install` fresh. Check browser console for errors. |
| "Cannot connect to MongoDB" | Check MONGODB_URI. Whitelist `0.0.0.0/0` in Atlas Network Access. |
| "Google OAuth redirect_uri_mismatch" | Redirect URI in .env must exactly match Google Cloud Console. |
| "No available slots" | Toggle availability days ON in /availability page. |
| AI suggestions not showing | Expected if OPENAI_API_KEY not set — silently disabled. |
| Port 5000 in use | Change PORT in backend .env. |
| Port 5173 in use | Change port in frontend/vite.config.js. |
