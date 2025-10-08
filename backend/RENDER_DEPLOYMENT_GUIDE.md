# 🚀 Render Deployment Guide - Choose Your Mode

## ⚡ TWO DEPLOYMENT OPTIONS

### OPTION 1: NORMAL MODE (Recommended) 🚀
**Use this by default!**
- ✅ Full performance with Redis caching
- ✅ Background job queues
- ✅ 50 database connections
- ✅ Fast response times
- 📊 Memory: ~600-800MB
- 💰 Works on: Paid plans (≥1GB RAM)

### OPTION 2: LOW MEMORY MODE 🐌
**Only use if you get "out of memory" errors on Render Free Tier**
- ⚠️ Reduced performance
- ❌ No Redis caching
- ❌ No background queues
- 🔻 Only 5 database connections
- 📊 Memory: ~300-400MB
- 💰 Works on: Free tier (512MB RAM)

---

## 📋 Render Environment Variables Setup

Go to: **Your Service → Environment Tab**

### For NORMAL MODE (Start Here):

```bash
NODE_ENV=production
ENABLE_LOW_MEMORY=false
ENABLE_CACHING=true
ENABLE_QUEUES=true
ENABLE_COMPRESSION=true
ENABLE_CLUSTERING=false
```

### For LOW MEMORY MODE (Only if needed):

```bash
NODE_ENV=production
ENABLE_LOW_MEMORY=true
ENABLE_CACHING=false
ENABLE_QUEUES=false
ENABLE_COMPRESSION=true
ENABLE_CLUSTERING=false
```

**PLUS** in Render Build Settings:
- Build Command: Keep as `npm install`
- Start Command: Change to `npm run start:low-memory`

---

## 🔐 Required Environment Variables (All Modes)

```bash
MONGODB_URI=mongodb+srv://hostadmin:kfSectzf5rAdQxeC@raghost.fsbpbw4.mongodb.net/?retryWrites=true&w=majority&appName=RAGhost
```

```bash
ENCRYPTION_KEY=d445d6ee70883c7bcbc0e5cd83fd30fa12a7f88862fd0c3d874cce289dcda765
```

```bash
CORS_ORIGINS=https://rag-host.vercel.app,http://localhost:5173
```

```bash
RATE_LIMIT_WINDOW_MS=900000
```

```bash
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔥 Firebase (IMPORTANT - Generate NEW Key!)

⚠️ **DO NOT use the old exposed key!**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → Project Settings → Service Accounts
3. Click "Generate New Private Key"
4. Add these to Render:

```bash
FIREBASE_PROJECT_ID=raghost-port
```

```bash
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
[PASTE YOUR NEW PRIVATE KEY HERE - Keep the line breaks!]
-----END PRIVATE KEY-----
```

```bash
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@raghost-port.iam.gserviceaccount.com
```

## 🌐 Optional: Redis (For NORMAL MODE only)

If you want caching in normal mode:

```bash
REDIS_URL=rediss://default:ASA4AAImcDI0M2M4YjFjNGFjZDE0OGVlYjkwMGM0YjhjMWU0NzgxZnAyODI0OA@beloved-man-8248.upstash.io:6379
```

---

## ✅ After Setup

1. Click **"Save Changes"** in Render
2. Render will auto-redeploy
3. Check logs for:
   - **Normal Mode:** `✅ NORMAL MODE (Full Performance)`
   - **Low Memory:** `⚠️ LOW MEMORY MODE ENABLED`
4. Test your API endpoints

---

## 🆘 Troubleshooting

### "Out of memory" error on Normal Mode?
→ Switch to **LOW MEMORY MODE** (see Option 2 above)

### Low Memory Mode too slow?
→ Upgrade Render plan to Starter ($7/mo, 1GB RAM)
→ Switch back to **NORMAL MODE**

### Still having issues?
→ Check `backend/MEMORY_OPTIMIZATION.md` for detailed troubleshooting

---

## 🎯 Quick Decision Guide

**Do you have Render Free Tier (512MB)?**
- Try NORMAL MODE first
- If you get "out of memory" → Switch to LOW MEMORY MODE

**Do you have a paid plan (≥1GB)?**
- Use NORMAL MODE (full performance!)

**Performance matters a lot?**
- Use paid plan + NORMAL MODE + Redis

---

**Last Updated:** Fixed to make Normal Mode the default
**Tested:** Render Free & Starter tiers
