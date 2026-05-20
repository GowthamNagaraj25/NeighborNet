# 🎬 NeighborNet Resilience — Hackathon Demo Script

> Estimated demo time: 8–10 minutes

---

## 🔧 Pre-Demo Setup

```bash
# Terminal 1 — Backend
cd server && npm install && npm run seed && npm run dev

# Terminal 2 — Frontend  
cd client && npm install && npm run dev

# Open browser: http://localhost:5173
```

---

## 📋 Demo Flow

### Step 1 — Landing Page (30 sec)
- Open `http://localhost:5173`
- Show the hero section: "Your neighborhood, stronger together"
- Point out: AI features, stats, how it works
- Click **"Get Started"**

---

### Step 2 — Login as Resident (30 sec)
- Click **"Sign In"** → Login page
- Click **"resident"** demo button to auto-fill
- Credentials: `resident@neighbornet.com` / `Resident@123`
- Login → lands on Dashboard

---

### Step 3 — Dashboard Tour (1 min)
- Show stats: Active Requests, Offers, Urgent Needs, Completed Helps
- Show **Community Pulse** section (dark card)
- Show **Verified Resident** badge
- Point out the **🚨 Emergency Help** button (red, pulsing)

---

### Step 4 — Create a Vague Request (1 min)
- Click **"+ New Post"**
- Fill in:
  - Type: **Request**
  - Title: `Pipe is leaking under my kitchen sink and I need someone nearby`
  - Category: **repairs**
  - Description: `Water is pooling under the kitchen sink. The pipe seems to be leaking. I don't know how to fix it myself.`
  - Urgency: **High**
  - Tags: `leak, kitchen, pipe`
- Submit → redirected to Post Details

---

### Step 5 — AI Semantic Matching (2 min) ⭐ KEY DEMO
- On Post Details, click **"🧠 View AI Matches"**
- OR navigate to **AI Matches** in navbar
- Select the post you just created
- Watch the AI analyze: "Expanding synonyms, scoring candidates..."
- **Show the results:**
  - "plumbing hobbyist" matched — score 65%+
  - AI Reason: *"Semantic similarity in description. Skills match: plumbing hobbyist. Within 2.3km"*
- **Explain to judges:** "The request said 'leaky sink' — the AI expanded this to plumbing, pipe, repair, tap, drain and matched Ravi Kumar who listed 'plumbing hobbyist' as a skill. No exact keywords needed."
- Click **"💬 Contact this helper"** → starts a chat thread

---

### Step 6 — Real-time Chat (1 min)
- Chat page opens with the matched resident
- Type a message: `Hi! I saw you can help with plumbing. My kitchen sink is leaking badly.`
- Send → message appears instantly
- **Point out:** Socket.IO real-time, no page refresh needed

---

### Step 7 — Emergency Alert (1 min)
- Go back to Dashboard
- Click the **🚨 Emergency Help** button (red pulsing button)
- Select **🩸 Blood** category
- Description: `Need O+ blood donor urgently at Apollo Hospital`
- Click **"🚨 Send Alert"**
- **Show:** Toast notification appears — "Critical help needed nearby!"
- **Explain:** All nearby verified users receive a Socket.IO push notification

---

### Step 8 — Community Map (1 min)
- Navigate to **🗺️ Map**
- Show all posts as colored markers:
  - 🔴 Red = Critical
  - 🟠 Orange = High
  - 🟡 Yellow = Medium
  - 🟢 Green = Low
- Click a marker → popup with post preview
- Show radius circles around posts
- Click **"Use My Location"** to center on user

---

### Step 9 — Login as Organizer (1 min)
- Logout → Login as `organizer@neighbornet.com` / `Organizer@123`
- Navigate to **📊 Organizer Dashboard**

---

### Step 10 — Trend Detection (1 min) ⭐
- Click **"📈 Trend Detection"** tab
- Show detected trends:
  - "Senior Care Needs Rising — 4 requests this week" (HIGH severity)
  - "Blood Donor Urgency — 2 critical requests" (CRITICAL severity)
- Click **"🤖 Generate Plan"** on the elderly-care trend
- **Show the AI Action Plan:**
  - Title: "Elderly Care Community Drive"
  - 3-step execution plan
  - Required volunteers and resources
  - Suggested message to organizers

---

### Step 11 — Logistics Intelligence (1 min) ⭐
- Click **"🗺️ Logistics Intelligence"** tab
- Click **"🤖 Generate Plan"**
- **Show the routing plan:**
  - "5 urgent requests matched to 4 volunteers"
  - Each volunteer assigned to specific request with reason
  - Coverage gaps identified
  - Recommendations listed
- **Explain:** "The algorithm scores each volunteer-request pair by urgency weight, distance, skill match, and trust score"

---

### Step 12 — Admin Dashboard (1 min)
- Logout → Login as `admin@neighbornet.com` / `Admin@123`
- Navigate to **⚙️ Admin Dashboard**
- Show **pending users** (yellow badge count)
- Click **"✅ Verify"** on a pending user → instantly verified
- Click **"🏅 Badge"** → assign "Emergency Responder" badge
- Show **Posts** tab → moderate content

---

### Step 13 — Blood Help Network (30 sec)
- Navigate to **🩸 Blood Help**
- Show blood requests with critical urgency highlighting
- Switch to **"Find Donors"** tab
- Filter by blood group **O+**
- Show donor cards with blood group badge
- Click **"💬 Contact Donor"**

---

## 🏆 Key Talking Points for Judges

1. **AI works offline** — no paid API needed, pure semantic matching
2. **Real-time** — Socket.IO for chat + emergency alerts
3. **Geospatial** — MongoDB 2dsphere indexes + Leaflet.js
4. **Role-based** — Resident / Organizer / Admin with different capabilities
5. **Production-ready** — Rate limiting, helmet, JWT, bcrypt, validation
6. **Deployable** — Vercel + Render + MongoDB Atlas instructions included
7. **Seed data** — 12 users, 12 posts, 2 initiatives, 2 trend insights ready

---

## 🔑 All Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@neighbornet.com | Admin@123 |
| Organizer | organizer@neighbornet.com | Organizer@123 |
| Resident (Ravi) | resident@neighbornet.com | Resident@123 |
| Resident (Meena) | meena@neighbornet.com | Resident@123 |
| Resident (Arjun) | arjun@neighbornet.com | Resident@123 |

---

*NeighborNet Resilience — Built for Hackathon 2024*
