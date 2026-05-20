# 🚀 NeighborNet Resilience — Complete Deployment Guide

This guide deploys NeighborNet permanently to the cloud using:
- **MongoDB Atlas** — free cloud database (replaces local MongoDB)
- **Render** — free backend hosting (Node.js + Express + Socket.IO)
- **Vercel** — free frontend hosting (React + Vite)

Once deployed, the app runs 24/7 with no local machine required.

---

## 📋 Overview

```
Browser → Vercel (Frontend) → Render (Backend API + Socket.IO) → MongoDB Atlas (Database)
```

Total cost: **Free** on all three platforms for a hackathon/demo scale.

---

## STEP 1 — MongoDB Atlas (Database)

### 1.1 Create Account
1. Go to https://www.mongodb.com/atlas
2. Click **"Try Free"** → sign up with Google or email
3. Choose **"Free"** plan (M0 Sandbox)
4. Select any cloud region (e.g. AWS / Singapore or Mumbai for India)
5. Click **"Create Cluster"** — takes ~2 minutes

### 1.2 Create Database User
1. In the left sidebar → **Database Access**
2. Click **"Add New Database User"**
3. Authentication: **Password**
4. Username: `neighbornet`
5. Password: click **"Autogenerate Secure Password"** → copy it somewhere safe
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

### 1.3 Allow Network Access
1. Left sidebar → **Network Access**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** → this adds `0.0.0.0/0`
4. Click **"Confirm"**

> This is required so Render's servers (which have dynamic IPs) can connect.

### 1.4 Get Connection String
1. Left sidebar → **Database** → click **"Connect"** on your cluster
2. Choose **"Drivers"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy the connection string — it looks like:
   ```
   mongodb+srv://neighbornet:<password>@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with the password you saved in step 1.2
6. Add the database name before the `?`:
   ```
   mongodb+srv://neighbornet:YOURPASSWORD@cluster0.abc123.mongodb.net/neighbornet?retryWrites=true&w=majority
   ```
7. **Save this full string** — you'll need it in Step 2.

### 1.5 Seed the Cloud Database
Once you have the Atlas connection string, run the seed from your local machine:

```bash
cd D:\NeighborNet\neighbornet-resilience\server

# Temporarily update .env with Atlas URI
# Change MONGO_URI to your Atlas connection string

npm run seed
```

You should see:
```
✅ Connected to MongoDB
✅ Created 12 users
✅ Created 12 posts
✅ Created initiatives
✅ Created trend insights
🎉 Seed completed successfully!
```

---

## STEP 2 — Render (Backend Deployment)

### 2.1 Prepare the Backend

First, add a `render.yaml` config file to the server folder:

**File: `server/render.yaml`**
```yaml
services:
  - type: web
    name: neighbornet-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

Also verify `server/package.json` has the start script:
```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js",
  "seed": "node src/utils/seedData.js"
}
```

### 2.2 Push Code to GitHub
Render deploys from GitHub. You need to push your project there first.

```bash
# In the project root
cd D:\NeighborNet\neighbornet-resilience

git init
git add .
git commit -m "Initial commit - NeighborNet Resilience"

# Create a new repo on github.com first, then:
git remote add origin https://github.com/YOUR_USERNAME/neighbornet-resilience.git
git branch -M main
git push -u origin main
```

> Go to https://github.com/new to create the repository first.

### 2.3 Deploy on Render
1. Go to https://render.com → Sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account → select `neighbornet-resilience` repo
4. Configure the service:

| Setting | Value |
|---|---|
| Name | `neighbornet-api` |
| Root Directory | `server` |
| Environment | `Node` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | **Free** |

5. Click **"Advanced"** → **"Add Environment Variable"** and add ALL of these:

| Key | Value |
|---|---|
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `MONGO_URI` | `mongodb+srv://neighbornet:YOURPASSWORD@cluster0.abc123.mongodb.net/neighbornet?retryWrites=true&w=majority` |
| `JWT_SECRET` | `neighbornet_super_secret_jwt_2024_production_key` |
| `CLIENT_URL` | `https://neighbornet-resilience.vercel.app` *(update after Step 3)* |

6. Click **"Create Web Service"**
7. Wait 3–5 minutes for the first deploy to complete
8. You'll get a URL like: `https://neighbornet-api.onrender.com`
9. **Copy this URL** — you need it for the frontend

### 2.4 Verify Backend is Live
Open in browser:
```
https://neighbornet-api.onrender.com/health
```

You should see:
```json
{
  "success": true,
  "message": "NeighborNet API is running",
  "timestamp": "2024-..."
}
```

### 2.5 Socket.IO on Render
Socket.IO works on Render out of the box. The existing `server.js` already handles this correctly — no changes needed. Render supports WebSocket connections on all plans.

---

## STEP 3 — Vercel (Frontend Deployment)

### 3.1 Update Frontend Environment
Update `client/.env` with your Render backend URL:

```bash
# client/.env  (for local development)
VITE_API_URL=http://localhost:5000

# client/.env.production  (create this new file)
VITE_API_URL=https://neighbornet-api.onrender.com
```

Create the production env file:

**File: `client/.env.production`**
```
VITE_API_URL=https://neighbornet-api.onrender.com
```

### 3.2 Test the Production Build Locally
```bash
cd D:\NeighborNet\neighbornet-resilience\client
npm run build
```

You should see a `dist/` folder created with no errors.

### 3.3 Deploy on Vercel
1. Go to https://vercel.com → Sign up with GitHub (free)
2. Click **"Add New Project"**
3. Import your `neighbornet-resilience` GitHub repository
4. Configure:

| Setting | Value |
|---|---|
| Framework Preset | `Vite` |
| Root Directory | `client` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

5. Click **"Environment Variables"** and add:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://neighbornet-api.onrender.com` |

6. Click **"Deploy"**
7. Wait ~2 minutes
8. You'll get a URL like: `https://neighbornet-resilience.vercel.app`

### 3.4 Update CORS on Render
Now that you have your Vercel URL, go back to Render:
1. Open your `neighbornet-api` service
2. Go to **Environment** tab
3. Update `CLIENT_URL` to your actual Vercel URL:
   ```
   CLIENT_URL = https://neighbornet-resilience.vercel.app
   ```
4. Click **"Save Changes"** — Render will auto-redeploy

---

## STEP 4 — Verify Full Deployment

Test each layer:

**1. Database:**
```
MongoDB Atlas → Collections → should show users, posts, initiatives
```

**2. Backend API:**
```
https://neighbornet-api.onrender.com/health
→ {"success": true, "message": "NeighborNet API is running"}
```

**3. Backend + Database:**
```
https://neighbornet-api.onrender.com/api/posts
→ {"success": true, "data": [...12 posts...]}
```

**4. Frontend:**
```
https://neighbornet-resilience.vercel.app
→ Landing page loads
```

**5. Full flow:**
- Open your Vercel URL
- Click Login
- Use: `resident@neighbornet.com` / `Resident@123`
- Should log in and show Dashboard

---

## STEP 5 — Persistent Process Management

### Render Auto-Restart
Render automatically restarts your service if it crashes. No configuration needed.

To verify:
1. Render Dashboard → your service → **"Events"** tab
2. Shows all deploys and restarts

### Render Free Tier Sleep Warning
On the free tier, Render **spins down** the backend after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake up.

**Fix — Add a keep-alive ping:**

Create this file:

**File: `server/src/utils/keepAlive.js`**
```js
// Pings the server every 14 minutes to prevent sleep on Render free tier
const https = require('https');

function keepAlive(url) {
  setInterval(() => {
    https.get(url, (res) => {
      console.log(`Keep-alive ping: ${res.statusCode}`);
    }).on('error', (err) => {
      console.log('Keep-alive error:', err.message);
    });
  }, 14 * 60 * 1000); // every 14 minutes
}

module.exports = keepAlive;
```

Then add to `server/src/server.js` at the bottom, before `server.listen`:
```js
// Keep-alive for Render free tier
if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
  const keepAlive = require('./utils/keepAlive');
  keepAlive(process.env.RENDER_EXTERNAL_URL + '/health');
}
```

Add the env variable in Render:
```
RENDER_EXTERNAL_URL = https://neighbornet-api.onrender.com
```

### Vercel — Always On
Vercel frontend is always on with no sleep. No configuration needed.

---

## STEP 6 — SSL / HTTPS

Both Render and Vercel provide **automatic HTTPS** with free SSL certificates. No configuration needed — your URLs will be `https://` by default.

Your Socket.IO connection in `client/src/services/socket.ts` already handles this:
```ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// In production this becomes: https://neighbornet-api.onrender.com
// Socket.IO automatically uses wss:// (secure WebSocket) when the URL is https://
```

---

## STEP 7 — Automatic Redeployment

Every time you push code to GitHub, both services redeploy automatically:

- **Render** — watches your `main` branch, redeploys on every push
- **Vercel** — watches your `main` branch, redeploys on every push

To update the live app:
```bash
git add .
git commit -m "Update: description of change"
git push origin main
# Both Render and Vercel will auto-deploy within 2-3 minutes
```

---

## STEP 8 — Monitoring & Troubleshooting

### Render Logs
1. Render Dashboard → your service → **"Logs"** tab
2. Shows real-time server logs, errors, and requests

### Vercel Logs
1. Vercel Dashboard → your project → **"Functions"** tab (for API routes)
2. Or **"Deployments"** → click a deployment → **"Build Logs"**

### Common Issues & Fixes

**❌ "This site can't be reached" on Vercel**
- Check Vercel deployment status — may still be building
- Check Build Logs for errors
- Verify `VITE_API_URL` environment variable is set

**❌ Login fails / API calls return 404**
- Check `VITE_API_URL` in Vercel env vars — must match your Render URL exactly
- No trailing slash: `https://neighbornet-api.onrender.com` ✅ not `https://neighbornet-api.onrender.com/` ❌

**❌ "CORS error" in browser console**
- Go to Render → update `CLIENT_URL` to match your exact Vercel URL
- Redeploy Render after changing env vars

**❌ MongoDB connection failed on Render**
- Check `MONGO_URI` in Render env vars — must include password and database name
- Check MongoDB Atlas → Network Access → confirm `0.0.0.0/0` is whitelisted
- Check Atlas → Database Access → confirm user has read/write permissions

**❌ Socket.IO not connecting in production**
- Verify `CLIENT_URL` on Render matches Vercel URL exactly (no trailing slash)
- Check browser console for WebSocket errors
- Render free tier supports WebSockets — no extra config needed

**❌ Render service sleeping (30s first load)**
- Add the keep-alive utility from Step 5
- Or upgrade to Render Starter ($7/month) for always-on

**❌ "JWT malformed" errors**
- Ensure `JWT_SECRET` is set in Render env vars
- Must be the same value used to generate existing tokens

---

## 📁 Final File Checklist

Before pushing to GitHub, confirm these files exist:

```
neighbornet-resilience/
├── server/
│   ├── .env.example          ✅ (no real secrets)
│   ├── src/server.js         ✅
│   ├── src/utils/keepAlive.js  ← create this (Step 5)
│   └── package.json          ✅ (has "start" script)
├── client/
│   ├── .env.example          ✅ (no real secrets)
│   ├── .env.production       ← create this (Step 3.1)
│   └── package.json          ✅
└── .gitignore                ← create this (below)
```

**Create `.gitignore` in project root:**
```
# Dependencies
node_modules/
*/node_modules/

# Environment files (never commit real secrets)
.env
server/.env
client/.env
client/.env.production

# Build output
client/dist/
client/build/

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db
```

> ⚠️ Never commit `.env` files with real passwords to GitHub.

---

## 🔑 Environment Variables Summary

### Render (Backend)
| Variable | Example Value |
|---|---|
| `PORT` | `5000` |
| `NODE_ENV` | `production` |
| `MONGO_URI` | `mongodb+srv://neighbornet:pass@cluster0.xyz.mongodb.net/neighbornet?retryWrites=true&w=majority` |
| `JWT_SECRET` | `neighbornet_super_secret_jwt_2024` |
| `CLIENT_URL` | `https://neighbornet-resilience.vercel.app` |
| `RENDER_EXTERNAL_URL` | `https://neighbornet-api.onrender.com` |

### Vercel (Frontend)
| Variable | Example Value |
|---|---|
| `VITE_API_URL` | `https://neighbornet-api.onrender.com` |

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Atlas database user created with password
- [ ] Atlas network access set to `0.0.0.0/0`
- [ ] Atlas connection string copied
- [ ] Seed data loaded to Atlas (`npm run seed` with Atlas URI)
- [ ] Code pushed to GitHub
- [ ] Render service created with correct env vars
- [ ] Backend health check passes: `/health`
- [ ] `client/.env.production` created with Render URL
- [ ] Vercel project created with correct env vars
- [ ] Frontend loads at Vercel URL
- [ ] Render `CLIENT_URL` updated to Vercel URL
- [ ] Login works end-to-end
- [ ] Socket.IO chat works
- [ ] Keep-alive added to prevent Render sleep

---

## 🌐 Your Live URLs (fill in after deployment)

| Service | URL |
|---|---|
| Frontend | `https://neighbornet-resilience.vercel.app` |
| Backend API | `https://neighbornet-api.onrender.com` |
| Health Check | `https://neighbornet-api.onrender.com/health` |
| Database | MongoDB Atlas Dashboard |

---

## 💡 Upgrade Path (when ready)

| Need | Solution | Cost |
|---|---|---|
| No sleep on backend | Render Starter plan | $7/month |
| Custom domain | Vercel + Render both support it | Free |
| More DB storage | MongoDB Atlas M2/M5 | $9–$25/month |
| Better performance | Render Standard | $25/month |

---

*NeighborNet Resilience — Deployed and running 24/7* 🏘️
