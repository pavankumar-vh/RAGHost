# Memory Optimization Guide for Render Free Tier (512MB)

## 🚨 The Problem
Render's free tier provides only 512MB of RAM, which can cause:
- "Ran out of memory" errors
- Automatic service restarts
- Failed deployments

## ✅ Solution Implemented

### 1. **Node.js Heap Optimization**
Updated `package.json` start script:
```json
"start": "node --max-old-space-size=400 --optimize-for-size --gc-interval=100 server.js"
```

Flags explained:
- `--max-old-space-size=400`: Limit heap to 400MB (leaves 112MB for system)
- `--optimize-for-size`: Prioritize memory over speed
- `--gc-interval=100`: More frequent garbage collection

### 2. **Database Connection Pool**
Reduced from 50 connections to 5:
```javascript
// Low Memory Mode
maxPoolSize: 5  // was 50
minPoolSize: 2  // was 10
```

### 3. **Compression Settings**
Lighter compression to save CPU/memory:
```javascript
level: 4        // was 6
threshold: 2048 // was 1024
memLevel: 7     // was 8
```

### 4. **Disabled Heavy Features**
- ❌ Redis caching (optional, saves ~50MB)
- ❌ Bull job queues (requires Redis)
- ❌ Clustering (single instance only)

### 5. **Request Body Limits**
Reduced from 10MB to 5MB:
```javascript
limit: '5mb'  // was '10mb'
```

## 📋 Render Environment Variables

Add these to your Render dashboard:

```bash
# REQUIRED
NODE_ENV=production
MONGODB_URI=your_mongodb_uri
ENCRYPTION_KEY=your_encryption_key

# Firebase (if using auth)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# Memory Optimization (IMPORTANT!)
ENABLE_HIGH_MEMORY=false
ENABLE_CLUSTERING=false
ENABLE_CACHING=false
ENABLE_COMPRESSION=true

# CORS
CORS_ORIGINS=https://rag-host.vercel.app
```

## 🔄 How to Deploy

1. **Commit changes:**
```bash
git add .
git commit -m "Add 512MB memory optimizations"
git push origin main
```

2. **In Render Dashboard:**
   - Go to your service
   - Click "Environment"
   - Add the environment variables above
   - Click "Save Changes"
   - Service will auto-redeploy

3. **Monitor deployment:**
   - Watch the logs for "512MB Optimized" message
   - Check for "Connection Pool: Min=2, Max=5"
   - Service should start successfully

## 📊 Expected Memory Usage

Before optimization: ~600MB (crashes)
After optimization: ~300-400MB (stable)

## 🚀 Performance Impact

**What you lose:**
- ❌ Redis caching (slower repeated queries)
- ❌ Background job queues (synchronous processing)
- ❌ Multiple connections (lower concurrent capacity)

**What you keep:**
- ✅ Full API functionality
- ✅ Chat capabilities
- ✅ File uploads (with 5MB limit)
- ✅ Firebase authentication
- ✅ MongoDB operations

## 🎯 Upgrade Path

When you upgrade to a paid plan with more memory:

1. Set `ENABLE_HIGH_MEMORY=true`
2. Set `ENABLE_CACHING=true`
3. Add Redis URL
4. Increase limits as needed

This will automatically enable:
- 50 database connections
- Redis caching
- Bull job queues
- 10MB request limits
- Better compression

## 🔍 Troubleshooting

### Still running out of memory?

1. **Check logs:**
```bash
# In Render dashboard, go to "Logs" tab
# Look for memory usage patterns
```

2. **Further reduce pool:**
```javascript
maxPoolSize: 3  // instead of 5
minPoolSize: 1  // instead of 2
```

3. **Disable compression:**
```bash
ENABLE_COMPRESSION=false
```

4. **Increase heap limit (risky):**
```json
"--max-old-space-size=450"  // instead of 400
```

### Monitor memory in production:

Add to your `/health` endpoint:
```javascript
memoryUsage: {
  heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
  heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
  rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
}
```

## 💡 Best Practices

1. **Keep dependencies minimal:** Regularly audit `package.json`
2. **Stream large files:** Don't load entire files into memory
3. **Limit concurrent requests:** Use rate limiting
4. **Clean up resources:** Always close connections
5. **Monitor regularly:** Check Render metrics

## 🆘 Still Need Help?

If memory issues persist:
1. Check for memory leaks in custom code
2. Consider Render's Starter plan ($7/month, 512MB → 1GB)
3. Optimize your routes to process less data
4. Implement pagination for large datasets

---

**Last Updated:** Added with memory optimization commit
**Tested On:** Render Free Tier (512MB RAM)
**Status:** ✅ Production Ready
