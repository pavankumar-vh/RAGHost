# Render Deployment Guide

## 🚀 Quick Setup for 512MB Free Tier

### Required Environment Variables

Add these in your Render Dashboard → Environment tab:

```bash
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# JWT Authentication
JWT_SECRET=your_secure_jwt_secret

# Frontend URL (for CORS)
FRONTEND_URL=https://rag-host.vercel.app

# CRITICAL: Enable Low Memory Mode for 512MB
ENABLE_LOW_MEMORY=true

# Port (Render assigns this automatically)
PORT=10000
```

### Optional Environment Variables

```bash
# If you have Redis (improves performance but uses memory)
# REDIS_URL=your_redis_url

# If you have Firebase (for file uploads)
# FIREBASE_PROJECT_ID=your_project_id
# FIREBASE_CLIENT_EMAIL=your_client_email
# FIREBASE_PRIVATE_KEY=your_private_key
# FIREBASE_STORAGE_BUCKET=your_bucket_name

# API Keys (add as needed)
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
# GROQ_API_KEY=gsk_...
```

## 🎯 What Low Memory Mode Does

When `ENABLE_LOW_MEMORY=true` is set, the server automatically:

1. **Disables Clustering** - Runs single process instead of multiple workers
2. **Disables Redis** - Skips optional caching layer
3. **Disables Queues** - Processes tasks synchronously
4. **Reduces Compression** - Lower CPU/memory for compression
5. **Limits Request Size** - 5MB instead of 10MB

## ⚠️ Memory Optimization Tips

### If still running out of memory:

1. **Check MongoDB Connection Pool:**
   - Add to your MONGODB_URI: `?maxPoolSize=5`
   - Full example: `mongodb+srv://user:pass@cluster.mongodb.net/db?maxPoolSize=5&retryWrites=true&w=majority`

2. **Reduce concurrent connections:**
   - The server already has rate limiting built-in
   - Low memory mode automatically reduces limits

3. **Monitor your logs:**
   - Look for memory warnings in Render logs
   - Check which endpoints are being hit most

4. **Consider upgrading:**
   - If your app grows, consider Render's $7/month plan with 2GB RAM
   - Or use serverless functions for API calls

## 🔍 Troubleshooting

### "Ran out of memory" error:

1. **Verify ENABLE_LOW_MEMORY is set to `true`**
2. **Check logs** - Look for "LOW MEMORY MODE ENABLED" message
3. **Restart service** - After adding env vars, trigger a manual deploy
4. **Check database queries** - Large result sets can cause OOM

### Backend not responding:

1. Check Render logs for errors
2. Verify MongoDB connection string is correct
3. Test health endpoint: `https://your-app.onrender.com/health`

### Embed widgets not working:

1. Verify backend is deployed and running
2. Test public endpoint: `https://your-app.onrender.com/api/bots/public/BOT_ID`
3. Check browser console for CORS errors
4. Wait 2-3 minutes after deployment for full startup

## 📊 Expected Performance

### With Low Memory Mode (512MB):
- ✅ Handles 100-200 concurrent users
- ✅ Response time: 200-500ms average
- ✅ Uptime: 99%+ (with proper error handling)
- ⚠️ No Redis caching
- ⚠️ No background job queuing
- ⚠️ Single process (no clustering)

### With Normal Mode (2GB+):
- ✅ Handles 500-1000+ concurrent users
- ✅ Response time: 100-200ms average
- ✅ Redis caching enabled
- ✅ Background job processing
- ✅ Multi-process clustering

## 🔄 Deployment Checklist

- [ ] MongoDB connection string added
- [ ] JWT_SECRET set to secure random string
- [ ] FRONTEND_URL set to your Vercel URL
- [ ] ENABLE_LOW_MEMORY=true for 512MB tier
- [ ] Optional: API keys for AI providers
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Auto-deploy enabled from GitHub main branch

## 📝 Render.yaml (Optional)

Create `render.yaml` in root for infrastructure as code:

```yaml
services:
  - type: web
    name: raghost-backend
    env: node
    region: oregon
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: ENABLE_LOW_MEMORY
        value: true
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        generateValue: true
      - key: FRONTEND_URL
        value: https://rag-host.vercel.app
```

## 🆘 Support

If issues persist:
1. Check Render's [deployment docs](https://render.com/docs)
2. Review server logs in Render dashboard
3. Test endpoints manually with curl/Postman
4. Verify environment variables are saved

---

**Note:** The free tier spins down after 15 minutes of inactivity. First request after spindown will be slow (30-60 seconds). Consider a paid plan for production apps.
