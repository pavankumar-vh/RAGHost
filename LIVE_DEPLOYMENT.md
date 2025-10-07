# 🎉 RAGHost - Deployment Complete!

## 🌐 Live URLs

**Frontend (Vercel):** https://rag-host.vercel.app  
**Backend (Render):** https://raghost-pcgw.onrender.com

---

## ✅ Configuration Status

### Frontend ✅
- [x] Deployed on Vercel
- [x] Connected to backend API
- [x] Environment variables configured
- [x] Firebase authentication active

### Backend ✅
- [x] Deployed on Render
- [x] MongoDB Atlas connected
- [x] CORS configured for Vercel
- [x] Firebase Admin SDK configured

---

## 🔧 Important Notes

### Render Free Tier Behavior
⚠️ **Auto-Sleep:** The backend on Render's free tier will sleep after 15 minutes of inactivity.

**What this means:**
- First request after sleep may take 30-60 seconds to wake up
- Subsequent requests will be fast
- This is normal for Render's free tier

**Solutions:**
1. **Keep-Alive Service** (Recommended): Use [UptimeRobot](https://uptimerobot.com) to ping your backend every 14 minutes
2. **Upgrade to Paid Plan**: $7/month for always-on service
3. **Alternative**: Deploy to Railway or Cyclic (different free tier limits)

### Environment Variables on Vercel

Make sure these are set in Vercel dashboard (already done if deployed):
```
VITE_API_URL=https://raghost-pcgw.onrender.com
VITE_FIREBASE_API_KEY=AIzaSyC7A55onN4e4CcrdTIW0JNPTvxATuUZfcw
VITE_FIREBASE_AUTH_DOMAIN=raghost-port.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=raghost-port
VITE_FIREBASE_STORAGE_BUCKET=raghost-port.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=177697515355
VITE_FIREBASE_APP_ID=1:177697515355:web:983468f414c979a4e41c7e
```

### Environment Variables on Render

Make sure these are set in Render dashboard:
```
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://hostadmin:kfSectzf5rAdQxeC@raghost.fsbpbw4.mongodb.net/?retryWrites=true&w=majority&appName=RAGhost
ENCRYPTION_KEY=d445d6ee70883c7bcbc0e5cd83fd30fa12a7f88862fd0c3d874cce289dcda765
CORS_ORIGINS=https://rag-host.vercel.app,http://localhost:5173
```

Plus Firebase credentials (get from Firebase Admin SDK JSON):
```
FIREBASE_PROJECT_ID=raghost-port
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@raghost-port.iam.gserviceaccount.com
```

---

## 🚀 Testing Your Deployment

1. **Visit:** https://rag-host.vercel.app
2. **Sign Up/Login** with email
3. **Create a Bot:**
   - Click "Create New Bot"
   - Give it a name and type
4. **Configure API Keys:**
   - Add Pinecone API Key
   - Add Google Gemini API Key
5. **Upload Documents:**
   - Go to Knowledge Base
   - Upload a PDF or TXT file
6. **Test Chat:**
   - Use embed code or test directly
7. **Check Analytics:**
   - View dashboard analytics
   - Monitor daily stats

---

## 🔄 Updating Your Deployment

### Frontend (Vercel)
Vercel auto-deploys on every push to `main` branch:
```bash
git add .
git commit -m "Update frontend"
git push origin main
```

### Backend (Render)
Render auto-deploys on every push to `main` branch:
```bash
git add .
git commit -m "Update backend"
git push origin main
```

---

## 🐛 Troubleshooting

### "Backend not responding" / "Network Error"
- **Cause:** Backend is sleeping (Render free tier)
- **Solution:** Wait 30-60 seconds and refresh. Set up UptimeRobot to prevent sleep.

### "CORS Error"
- **Check:** Backend CORS includes `https://rag-host.vercel.app`
- **Fix:** Update `backend/server.js` allowedOrigins array

### "Firebase Auth Error"
- **Check:** Firebase config is correct in Vercel environment variables
- **Fix:** Verify all Firebase env vars match your Firebase console

### "MongoDB Connection Failed"
- **Check:** MongoDB Atlas IP whitelist allows `0.0.0.0/0`
- **Fix:** Go to MongoDB Atlas → Network Access → Add IP Address → Allow All

---

## 📊 Monitoring Setup (Recommended)

### 1. UptimeRobot (Keep Backend Awake)
1. Go to https://uptimerobot.com
2. Add New Monitor
3. Type: HTTP(s)
4. URL: `https://raghost-pcgw.onrender.com/health`
5. Interval: 14 minutes
6. This prevents backend from sleeping!

### 2. Vercel Analytics (Optional)
- Enable in Vercel dashboard
- Track page views and performance

### 3. Sentry (Error Tracking - Optional)
- Free tier: 5,000 errors/month
- Catch frontend and backend errors

---

## 🎯 Next Steps

- [ ] Set up UptimeRobot to keep backend alive
- [ ] Add your project to your portfolio
- [ ] Share on social media
- [ ] Respond to GitHub issues
- [ ] Add more features
- [ ] Invite contributors

---

## 📱 Share Your Success!

Your project is now live! Share it:

**Twitter/X:**
```
🚀 Just launched RAGHost - an open-source RAG chatbot hosting platform!

✨ Features:
- Multiple AI chatbots
- Document knowledge base
- Advanced analytics
- Easy embedding

Built with React, Node.js, MongoDB, Pinecone & Gemini AI

🔗 Live: https://rag-host.vercel.app
💻 GitHub: https://github.com/pavankumar-vh/RAGHost

#OpenSource #AI #RAG #Chatbot
```

**LinkedIn/Dev.to:**
Highlight your tech stack, challenges solved, and what you learned!

---

## 🙏 Support

If you find this project useful:
- ⭐ Star the repo
- 🐛 Report issues
- 💡 Suggest features
- 🤝 Contribute code

---

**Made with ❤️ by [Pavan Kumar VH](https://github.com/pavankumar-vh)**

🎉 **Congratulations on your deployment!**
