# 🔄 Quick Redeploy Instructions

Your configuration has been updated! Here's what to do next:

## Backend (Render) - Auto-Deploys ✅

Render will automatically detect the git push and redeploy. Watch the deployment:
1. Go to https://dashboard.render.com
2. Click on your `raghost-backend` service
3. You'll see "Deploy in progress..." in the events tab
4. Wait 5-10 minutes for deployment to complete

## Frontend (Vercel) - Needs Manual Redeploy 🔄

### Option 1: Push a Small Change (Recommended)
The easiest way is to trigger a redeploy by pushing the production env file:

```bash
# Make sure you have the latest changes
git pull origin main

# Trigger Vercel redeploy (already done with the last push!)
```

Vercel should auto-deploy from the git push we just did!

### Option 2: Manual Redeploy in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click on your `rag-host` project
3. Go to "Deployments" tab
4. Click the three dots on the latest deployment
5. Click "Redeploy"

### Option 3: Update Environment Variable (Forces Rebuild)

1. Go to https://vercel.com/dashboard
2. Click on your `rag-host` project  
3. Settings → Environment Variables
4. **Update or verify** `VITE_API_URL`:
   ```
   VITE_API_URL=https://raghost-pcgw.onrender.com
   ```
5. This will trigger an automatic redeploy!

---

## ✅ Verification Steps

### 1. Check Backend
```bash
# Test backend health
curl https://raghost-pcgw.onrender.com/health
```

Should return something like:
```json
{"status":"ok","timestamp":"..."}
```

### 2. Check Frontend
1. Visit: https://rag-host.vercel.app
2. Open browser console (F12)
3. Check for any errors
4. Try to sign up/login

### 3. Test CORS
1. Login to your frontend
2. Try to create a bot
3. If you get CORS errors, wait for Render to finish deploying

---

## ⏱️ Wait Times

- **Render Deploy:** 5-10 minutes (first time might take longer)
- **Vercel Deploy:** 1-2 minutes
- **Render Wake-Up:** 30-60 seconds (if backend was sleeping)

---

## 🔍 Check Deployment Status

### Render Status:
- Dashboard: https://dashboard.render.com
- Look for "Live" status with green dot

### Vercel Status:
- Dashboard: https://vercel.com/dashboard
- Look for "Ready" status with green checkmark

---

## 🎯 After Both Deploy

1. **Test the app**: https://rag-host.vercel.app
2. **Create a bot** and test chat functionality
3. **Set up UptimeRobot** to keep backend alive (recommended!)

---

## 🐛 If Something Goes Wrong

### Backend Issues:
- Check Render logs in dashboard
- Verify environment variables are set
- Check MongoDB Atlas IP whitelist

### Frontend Issues:
- Check Vercel deployment logs
- Verify `VITE_API_URL` is correct
- Check browser console for errors

### CORS Issues:
- Make sure backend has finished deploying with new CORS config
- Clear browser cache and try again

---

## 📊 Set Up Monitoring (Do This Now!)

### UptimeRobot (Prevent Backend Sleep)
1. Go to https://uptimerobot.com (free account)
2. Add New Monitor:
   - Type: HTTP(s)
   - URL: `https://raghost-pcgw.onrender.com/health`
   - Interval: 14 minutes
3. This keeps your backend alive 24/7!

---

Your app should be fully functional in about 10-15 minutes! 🎉

Visit: https://rag-host.vercel.app
