# 🏘️ NeighborNet Resilience
### Project Overview & Feature Documentation

---

## 📌 Project Summary

**NeighborNet Resilience** is a hyper-local mutual aid and neighborhood resilience platform that connects verified residents to request help, offer skills and resources, communicate in real time, and respond to community emergencies — all powered by an AI engine that understands natural language and detects neighborhood trends.

Built as a civic-tech solution, the platform addresses a fundamental gap: people in every neighborhood need help and want to help, but they cannot find each other. NeighborNet bridges this gap intelligently.

---

## 🎯 Problem Statement

In every neighborhood:
- Elderly residents need medicine pickup but have no one to ask
- Families face sudden financial emergencies with no community safety net
- Skilled neighbors (plumbers, tutors, drivers) don't know who needs them
- Blood donors are unaware of urgent requests nearby
- Community organizers have no visibility into emerging local crises

**NeighborNet solves all of this in one platform.**

---

## 👥 Target Users

| Role | Who They Are | What They Do |
|---|---|---|
| **Resident** | Verified neighborhood member | Post requests, offer help, chat, respond to emergencies |
| **Organizer** | Community leader or NGO worker | View AI trends, generate action plans, launch drives |
| **Admin** | Platform moderator | Verify residents, assign badges, moderate content |

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcrypt |
| Real-time | Socket.IO |
| Maps | Leaflet.js + React-Leaflet |
| AI Engine | Custom semantic matching (no paid API required) |

---

## ✨ Core Features

### 1. 🔐 Secure Authentication & Community Verification
- User registration with role selection (Resident / Organizer / Admin)
- JWT-based authentication with persistent sessions
- Community verification flow — residents submit address proof, neighborhood code, and a local reference
- **Demo simulation button** for instant verification during demos
- Admin can manually verify or reject pending residents
- Verified badge displayed on all posts and profiles

---

### 2. 📋 Mutual Aid Marketplace (Notice Board)
The heart of the platform — a filterable, searchable board of community requests and offers.

**Post Types:**
- 🙏 **Request** — "I need help with..."
- 🤝 **Offer** — "I can help with..."

**Categories:**
Groceries · Medical · Transport · Tools · Repairs · Childcare · Elderly Care · Education · Blood · Emergency · Money Lending · Logistics · Other

**Urgency Levels:**
- 🔴 Critical — Immediate response needed
- 🟠 High — Urgent but not life-threatening
- 🟡 Medium — Needed soon
- 🟢 Low — Flexible timing

**Features:**
- Filter by type, category, urgency, status, and keyword search
- Sort by newest, most urgent, or nearest
- Color-coded urgency borders on post cards
- Verification badge on author cards
- Post status tracking: Open → Matched → In Progress → Completed

---

### 3. 🧠 AI Semantic Matchmaking *(Flagship Feature)*
The AI engine connects vague requests to relevant helpers without requiring exact keyword matches.

**How it works:**

```
User types: "Pipe is leaking under my kitchen sink"
AI expands: leak → plumbing, pipe, tap, sink, water, repair, faucet
AI matches: User with skill "plumbing hobbyist" → Score: 72%
```

**More examples:**
| Request | Matched Skill |
|---|---|
| "Grandmother feels lonely" | "elderly companionship", "daily phone check-in" |
| "Need help getting medicine" | "pharmacy pickup", "medical volunteer", "bike delivery" |
| "Water leaking under sink" | "plumbing hobbyist", "pipe repair", "home maintenance" |

**Scoring Formula:**
```
score = textSimilarity × 0.5
      + categoryMatch × 0.3
      + urgencyBoost
      + distanceBoost
      + verifiedUserBoost
```

**Every match shows:**
- Match score percentage
- AI explanation of why it matched
- Suggested next action
- Distance from requester

**Works 100% offline — no paid AI API required.**

---

### 4. 🗺️ Interactive Community Map
A live Leaflet.js map showing all active posts in the neighborhood.

**Features:**
- Color-coded markers by urgency (🔴 Critical · 🟠 High · 🟡 Medium · 🟢 Low)
- 🙏 emoji for requests, 🤝 for offers
- Radius circles showing each post's vicinity area
- Click any marker to see post preview popup
- Filter by category and urgency
- "Use My Location" button to center map on user
- Adjustable search radius (2km / 5km / 10km / 20km)

---

### 5. 💬 Real-time Chat (Socket.IO)
One-to-one messaging between residents, linked to specific posts.

**Features:**
- Start a chat directly from a post or AI match
- Messages delivered instantly via WebSocket
- Thread list with last message preview
- Unread message tracking
- Chat linked to the relevant post for context
- Mobile-responsive chat interface

---

### 6. 🚨 Emergency Alert System
A prominent **Emergency Help** button on the dashboard for critical situations.

**Emergency Categories:**
- 💊 Medical
- 🩸 Blood
- 🛒 Food
- 🚗 Transport
- 🚨 Safety
- 💰 Financial

**What happens:**
1. User fills a quick form (category + description)
2. Post is created with **Critical** urgency
3. Socket.IO instantly notifies all nearby verified residents
4. Toast notification appears: *"🚨 Critical help needed nearby!"*

---

### 7. 🩸 Blood Donor Network
A dedicated section for blood donation coordination.

**Features:**
- Register as a blood donor with blood group
- Filter donors by blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)
- View donor cards with verification status and badges
- Create urgent blood requests with hospital details
- Critical blood requests trigger immediate alerts to matching donors
- Direct chat with donors from their card

---

### 8. 💰 Community Micro-Lending
Safe peer-to-peer financial support within the community.

**Features:**
- Create financial assistance requests with amount needed
- Optional repayment date
- AI matches with users who listed "financial support volunteer" or "micro lending" skills
- Transparent disclaimer: *"Community support only. Platform does not process payments."*

---

### 9. 📊 Organizer Dashboard
A command center for community leaders with three powerful tools:

#### A. AI Trend Detection
Analyzes all posts from the last 7 days and detects emerging patterns.

**Example output:**
> *"Senior Care Needs Rising — 4 requests this week. Signals include loneliness, medicine pickup, and daily check-in needs. Severity: HIGH"*

Trends are ranked by severity and show evidence count and affected area.

#### B. AI Action Plan Generator
Click any trend to generate a structured community response plan.

**Plan includes:**
- Drive title and objective
- Target residents
- Required volunteer count
- Required resources list
- 3-step execution plan
- Suggested message to send to the community
- Success metrics

**Example:**
> **"Senior Warm Check-in Drive"**
> 1. Identify 20 senior residents within 2km using community map
> 2. Assign 2 volunteers per senior for daily phone check-ins and weekly visits
> 3. Set up medicine pickup relay — volunteers collect from pharmacy and deliver

#### C. Logistics Intelligence (Smart Resource Routing)
AI algorithm that matches urgent requests to the nearest available volunteers.

**Scoring per volunteer-request pair:**
```
score = urgencyWeight × 0.35
      + distanceScore × 0.30
      + skillMatchScore × 0.25
      + trustScore × 0.10
```

**Output includes:**
- Volunteer assignments with priority order
- Distance and reason for each assignment
- Coverage gaps (e.g., "No B- blood donor found within 5km")
- Recommendations (e.g., "Launch emergency blood donor drive")

---

### 10. ⚙️ Admin Dashboard
Full platform management for administrators.

**Features:**
- View all users with verification status filter
- One-click verify or reject pending residents
- View verification submission details (address proof, neighborhood code, reference)
- Assign community badges to deserving residents
- View and moderate all posts
- Delete inappropriate content

---

### 11. 🏅 Community Trust Badges
Badges are awarded to recognize community contributions.

| Badge | Awarded For |
|---|---|
| ✅ Verified Resident | Completing community verification |
| 🌟 First Helper | First completed help |
| 🩸 Blood Donor | Registering as blood donor |
| 🔧 Tool Sharer | Offering tools to the community |
| 🚨 Emergency Responder | Responding to critical requests |
| 👴 Elder Support | Helping elderly residents |
| 🏘️ Community Organizer | Creating community initiatives |
| 🏆 Completed 5 Helps | Completing 5 successful helps |

Badges appear on profile pages, post cards, and chat headers.

---

### 12. 🏘️ Community Initiatives
Organizers can create and manage structured community drives.

**Features:**
- Create initiatives with title, description, target category, and action plan
- Set required volunteer count and resources
- Track status: Planned → Active → Completed
- Visible to all residents to encourage participation

---

### 13. 👤 User Profile
Each resident has a rich profile page.

**Profile includes:**
- Name, neighborhood, verification status
- Trust score (visual progress bar, 0–100)
- Earned badges
- Skills list
- Availability
- Blood donor information (blood group, willing to donate)
- Emergency contact

---

## 🔄 How a Typical Interaction Works

```
1. Resident signs up → completes verification (or simulates it for demo)
2. Resident posts: "Pipe is leaking under my kitchen sink"
3. AI analyzes the post → finds "plumbing hobbyist" Ravi Kumar nearby
4. Match shown with 72% score and explanation
5. Resident clicks "Start Chat" → real-time conversation begins
6. Ravi agrees to help → post status updated to "In Progress"
7. Help completed → post marked "Completed" → badges awarded
8. Organizer sees trend: "3 repair requests this week in Adyar"
9. Organizer generates action plan → launches "Skill Share Saturday" initiative
```

---

## 🤖 AI Engine — Technical Details

The AI works entirely offline using a custom semantic matching algorithm:

**Step 1 — Tokenization**
Text is normalized, lowercased, and stop words are removed.

**Step 2 — Synonym Expansion**
Each token is expanded using a domain-specific synonym dictionary:
```
plumbing → [leak, pipe, tap, sink, water, repair, faucet, drain, clog]
elderly-care → [senior, old, grandmother, isolation, lonely, medicine, companion]
blood → [donor, plasma, emergency, transfusion, donate, group]
```

**Step 3 — Jaccard Similarity**
Expanded token sets are compared using Jaccard similarity + direct overlap boost.

**Step 4 — Multi-factor Scoring**
Final score combines text similarity, category match, urgency, distance, and verification status.

**Step 5 — Ranked Results**
Top 10 matches returned with scores, distances, and human-readable explanations.

---

## 📡 API Overview

| Group | Endpoints |
|---|---|
| Auth | Register, Login, Get Me, Submit Verification, Simulate Verification |
| Users | Get Profile, Update Profile, Nearby Users, Blood Donors |
| Posts | CRUD, Update Status, My Posts, Nearby Posts |
| Messages | Get Threads, Create Thread, Get Messages, Send Message |
| AI | Get Matches, Get Trends, Generate Action Plan, Logistics Plan, Community Pulse |
| Initiatives | CRUD, Update Status |
| Admin | Manage Users, Verify Residents, Assign Badges, Moderate Posts |

---

## 🗄️ Database Models

| Model | Purpose |
|---|---|
| **User** | Resident profiles with location, skills, badges, blood donor info |
| **Post** | Aid requests and offers with geospatial location |
| **MessageThread** | Conversation containers linking participants and posts |
| **Message** | Individual chat messages with read receipts |
| **Initiative** | Community drives created by organizers |
| **TrendInsight** | AI-detected community trend records |

All location fields use **MongoDB 2dsphere indexes** for efficient geospatial queries.

---

## 🔒 Security & Quality

- **JWT authentication** with 7-day token expiry
- **bcrypt password hashing** (12 salt rounds)
- **Rate limiting** — 200 req/15min general, 20 req/15min for auth
- **Helmet.js** security headers
- **CORS** configured for specific frontend origin
- **Input validation** on all POST/PUT endpoints
- **Role-based authorization** middleware
- **Centralized error handling** with consistent JSON responses

---

## 🚀 Running the Project

```bash
# 1. Start MongoDB (already installed as Windows service)

# 2. Backend
cd server
npm install
npm run seed      # Load demo data
npm run dev       # Starts on http://localhost:5000

# 3. Frontend
cd client
npm install
npm run dev       # Starts on http://localhost:5173
```

---

## 🎭 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@neighbornet.com | Admin@123 |
| Organizer | organizer@neighbornet.com | Organizer@123 |
| Resident | resident@neighbornet.com | Resident@123 |

---

## 👨‍💻 Team

**Gowtham · Preethi · KaviyaDharshini · Durga**

*Built for Hackathon 2024 — Civic Tech Track*

---

*NeighborNet Resilience — Built for the community, by the community* 🏘️
