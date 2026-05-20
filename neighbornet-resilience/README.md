# 🏘️ NeighborNet Resilience

> A hyper-local mutual aid and neighborhood resilience platform powered by AI semantic matching, real-time messaging, and community intelligence.

---

## 🎯 Problem Statement

In every neighborhood, people need help and people want to help — but they can't find each other. Elderly residents need medicine pickup. Families face sudden financial emergencies. Skilled neighbors don't know who needs their expertise. NeighborNet bridges this gap with AI-powered community intelligence.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤝 Mutual Aid Marketplace | Post requests and offers for groceries, repairs, transport, childcare, and more |
| 🧠 AI Semantic Matching | Connects "leaky sink" to "plumbing hobbyist" without exact keywords |
| 🗺️ Interactive Map | Leaflet.js map with color-coded urgency markers and radius circles |
| 💬 Real-time Chat | Socket.IO powered one-to-one messaging linked to posts |
| 🚨 Emergency Alerts | Critical posts trigger instant Socket.IO notifications to nearby users |
| 🩸 Blood Donor Network | Find donors by blood group and proximity, with emergency alerts |
| 📊 Trend Detection | AI analyzes 7-day post patterns to detect community needs |
| 🗺️ Logistics Intelligence | Smart volunteer-to-request routing with gap analysis |
| 🏅 Trust Badges | Verified Resident, Blood Donor, Emergency Responder, and more |
| 💰 Micro-Lending | Community financial support with transparency disclaimer |
| 👴 Elder Care | Dedicated elderly care category with companion matching |
| ⚙️ Admin Dashboard | Verify residents, assign badges, moderate posts |

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite + TypeScript
- Tailwind CSS
- React Router v6
- Leaflet.js + React-Leaflet
- Socket.IO Client
- Axios
- React Hot Toast

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT + bcryptjs
- Socket.IO
- express-rate-limit + helmet
- express-validator

**AI Engine** (fully offline, no API key required)
- Synonym expansion dictionary
- TF-IDF-style semantic scoring
- Category + distance + trust boosting
- Trend detection from post patterns
- Logistics routing algorithm

---

## 🗄️ Database Schema

| Model | Key Fields |
|---|---|
| User | name, email, role, verificationStatus, location (GeoJSON), skills, badges, trustScore, bloodGroup |
| Post | author, type, category, urgency, status, location (GeoJSON), tags, matchedUsers |
| MessageThread | participants, post, lastMessage |
| Message | thread, sender, text, readBy |
| Initiative | title, organizer, targetCategory, actionPlan, status |
| TrendInsight | title, category, severity, evidenceCount, recommendedAction |

---

## 🔌 API Routes

```
Auth:       POST /api/auth/register|login  GET /api/auth/me
Users:      GET /api/users/profile/:id  PUT /api/users/me  GET /api/users/blood-donors
Posts:      GET|POST /api/posts  GET|PUT|DELETE /api/posts/:id  PATCH /api/posts/:id/status
Messages:   GET|POST /api/threads  GET|POST /api/threads/:id/messages
AI:         GET /api/ai/matches/:postId  GET /api/ai/trends  POST /api/ai/action-plan
            GET /api/ai/logistics-plan  GET /api/ai/community-pulse
Initiatives: GET|POST /api/initiatives  PUT /api/initiatives/:id
Admin:      GET /api/admin/users|posts  PATCH /api/admin/users/:id/verify|badges
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
npm run seed      # Load demo data
npm run dev       # Start on port 5000
```

### Frontend

```bash
cd client
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:5000
npm run dev       # Start on port 5173
```

---

## 🔐 Environment Variables

**Backend (`server/.env`)**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/neighbornet
JWT_SECRET=your_super_secret_key
CLIENT_URL=http://localhost:5173
OPTIONAL_AI_API_KEY=          # Optional, app works without it
NODE_ENV=development
```

**Frontend (`client/.env`)**
```
VITE_API_URL=http://localhost:5000
```

---

## 👤 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@neighbornet.com | Admin@123 |
| Organizer | organizer@neighbornet.com | Organizer@123 |
| Resident | resident@neighbornet.com | Resident@123 |

---

## 🌐 Deployment

### MongoDB Atlas
1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free M0 cluster
3. Add database user and whitelist IP `0.0.0.0/0`
4. Copy connection string → set as `MONGO_URI`

### Backend → Render
1. Push code to GitHub
2. New Web Service on [render.com](https://render.com)
3. Build command: `npm install`
4. Start command: `npm start`
5. Set environment variables in Render dashboard

### Frontend → Vercel
1. Push code to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Framework: Vite
4. Set `VITE_API_URL=https://your-backend.onrender.com`
5. Deploy

---

## 🤖 AI Explanation

The AI engine works **fully offline** with no external API required:

1. **Semantic Matching**: Tokenizes post text → expands synonyms (e.g. "sink" → plumbing, pipe, leak, repair) → calculates Jaccard similarity between expanded token sets
2. **Scoring**: `score = textSim×0.5 + categorySim×0.3 + urgencyBoost + distanceBoost + verifiedBoost`
3. **Trend Detection**: Groups posts by category over 7 days → detects spikes → generates severity ratings
4. **Action Plans**: Template-based structured plans with 3-step execution, resource lists, and success metrics
5. **Logistics Routing**: Scores volunteer-request pairs by urgency×0.35 + distance×0.3 + skillMatch×0.25 + trust×0.1

---

## 🔮 Future Scope

- Push notifications (PWA)
- Multi-language support (Tamil, Hindi)
- Offline-first with service workers
- Integration with government welfare databases
- Community credit scoring
- Video call support for elder care
- WhatsApp bot integration

---

*Built for Hackathon 2024 — Civic Tech Track*
