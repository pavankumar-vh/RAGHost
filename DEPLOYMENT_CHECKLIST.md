# 🚀 RAGHost Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Repository Setup
- [x] Code pushed to GitHub
- [ ] Repository is public
- [ ] Add repository description
- [ ] Add topics/tags (chatbot, rag, ai, mongodb, react)
- [ ] Add repository homepage URL (after deployment)

### 2. Environment Setup
- [ ] MongoDB Atlas cluster created
- [ ] Firebase project configured
- [ ] Pinecone account created
- [ ] Google AI Studio API key obtained
- [ ] All API keys documented securely

### 3. Code Preparation
- [ ] Update CORS origins in `backend/server.js`
- [ ] Test locally with production environment variables
- [ ] Remove debug console.logs (optional)
- [ ] Update API URLs in frontend

## 🌐 Frontend Deployment (Vercel)

### Step-by-Step:
1. [ ] Go to https://vercel.com
2. [ ] Sign in with GitHub
3. [ ] Click "Add New" → "Project"
4. [ ] Import `RAGHost` repository
5. [ ] Configure project:
   - Root Directory: `frontend`
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. [ ] Add Environment Variables:
   ```
   VITE_API_URL=https://your-backend-url.com
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
7. [ ] Click "Deploy"
8. [ ] Wait for deployment to complete
9. [ ] Copy your Vercel URL

**Your Frontend URL:** `___________________.vercel.app`

## 🔧 Backend Deployment (Render)

### Step-by-Step:
1. [ ] Go to https://render.com
2. [ ] Sign in with GitHub
3. [ ] Click "New +" → "Web Service"
4. [ ] Connect `RAGHost` repository
5. [ ] Configure:
   - Name: `raghost-backend`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: **Free**
6. [ ] Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=5001
   MONGODB_URI=mongodb+srv://...
   FIREBASE_PROJECT_ID=...
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=...@...iam.gserviceaccount.com
   ```
7. [ ] Click "Create Web Service"
8. [ ] Wait for deployment (5-10 minutes)
9. [ ] Copy your Render URL

**Your Backend URL:** `___________________.onrender.com`

## 🔄 Post-Deployment Configuration

### Update Frontend with Backend URL
1. [ ] Go back to Vercel
2. [ ] Settings → Environment Variables
3. [ ] Update `VITE_API_URL` with your Render backend URL
4. [ ] Redeploy frontend

### Update Backend CORS
1. [ ] Update `backend/server.js` CORS configuration
2. [ ] Add your Vercel frontend URL to allowed origins
3. [ ] Push changes to GitHub (auto-deploys)

### MongoDB Configuration
1. [ ] Go to MongoDB Atlas
2. [ ] Network Access → Add IP Address
3. [ ] Click "Allow Access from Anywhere" (0.0.0.0/0)
4. [ ] Confirm

## ✅ Testing Checklist

- [ ] Visit your frontend URL
- [ ] Sign up / Login works
- [ ] Create a new bot
- [ ] Add API keys (Pinecone + Gemini)
- [ ] Upload a document
- [ ] Test chat functionality
- [ ] Check analytics dashboard
- [ ] Test embed widget on a test page
- [ ] Check mobile responsiveness

## 📝 Final Steps

### Update Repository
- [ ] Add live demo URL to README.md
- [ ] Add shields/badges to README
- [ ] Take screenshots for README
- [ ] Update repository settings:
  - [ ] Add website URL
  - [ ] Add topics
  - [ ] Enable discussions (optional)
  - [ ] Enable issues

### Share Your Project
- [ ] Tweet about it
- [ ] Post on Reddit (r/webdev, r/reactjs, r/nodejs)
- [ ] Post on LinkedIn
- [ ] Share on Dev.to
- [ ] Add to your portfolio

## 🐛 Troubleshooting

### Common Issues:

**Backend not starting on Render:**
- Check environment variables are correct
- Verify MongoDB connection string
- Check Render logs for errors
- Ensure Node.js version is 18+

**Frontend can't connect to Backend:**
- Verify CORS settings
- Check VITE_API_URL is correct
- Open browser console for errors
- Test backend URL directly

**Chat not working:**
- Verify bot has API keys configured
- Check Pinecone and Gemini keys are valid
- Check backend logs for errors
- Ensure documents are uploaded

**MongoDB connection fails:**
- Verify connection string is correct
- Check MongoDB Atlas IP whitelist
- Ensure user has proper permissions
- Test connection string locally first

## 📊 Monitoring

Set up monitoring for your deployed app:
- [ ] [UptimeRobot](https://uptimerobot.com) - Free uptime monitoring
- [ ] [Sentry](https://sentry.io) - Error tracking (optional)
- [ ] [Google Analytics](https://analytics.google.com) - Usage analytics (optional)

## 🎉 Success!

Congratulations! Your RAGHost is now live and open-source!

**Live URLs:**
- Frontend: https://________________________
- Backend: https://________________________
- GitHub: https://github.com/pavankumar-vh/RAGHost

---

**Next Steps:**
1. Monitor your deployments
2. Respond to issues and PRs
3. Add more features
4. Grow your community
5. Keep dependencies updated

🌟 Don't forget to star your own repo!
