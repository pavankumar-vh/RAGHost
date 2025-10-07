# VERCEL Environment Variables Setup

## Quick Fix for Frontend Not Connected to Backend

The frontend on Vercel needs environment variables set in the Vercel dashboard.

### Steps:

1. Go to https://vercel.com/dashboard
2. Select your project: `rag-host` or `chatbot-hosting-frontend`
3. Go to **Settings** → **Environment Variables**
4. Add these variables (for Production, Preview, and Development):

```
VITE_API_URL = https://raghost-pcgw.onrender.com
VITE_FIREBASE_API_KEY = AIzaSyC7A55onN4e4CcrdTIW0JNPTvxATuUZfcw
VITE_FIREBASE_AUTH_DOMAIN = raghost-port.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = raghost-port
VITE_FIREBASE_STORAGE_BUCKET = raghost-port.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 177697515355
VITE_FIREBASE_APP_ID = 1:177697515355:web:983468f414c979a4e41c7e
```

5. Click **Save**
6. Go to **Deployments** tab
7. Click the **three dots (...)** on the latest deployment
8. Select **Redeploy**
9. Check **"Use existing Build Cache"** is OFF
10. Click **Redeploy**

### Verify:
After redeployment (takes 1-2 minutes):
- Open https://rag-host.vercel.app
- Open browser console (F12)
- Check for API calls - they should go to `https://raghost-pcgw.onrender.com`
- Try signing up/logging in to test the connection

### Note:
The vercel.json file in the frontend directory provides defaults, but Vercel dashboard environment variables take precedence and are required for production builds.
