# Deployment Guide

## Quick Deploy Options

### Frontend Deployment

#### Option 1: Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/pavankumar-vh/RAGHost)

1. Click the button above or go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Set root directory to `frontend`
4. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Add environment variables (see `.env.example`)
6. Deploy!

#### Option 2: Netlify

1. Go to [Netlify](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
5. Add environment variables
6. Deploy!

### Backend Deployment

#### Option 1: Render (Recommended)

1. Go to [Render](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: raghost-backend
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Add environment variables:
   ```
   MONGODB_URI=your_mongodb_uri
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY=your_private_key
   FIREBASE_CLIENT_EMAIL=your_client_email
   NODE_ENV=production
   PORT=5001
   ```
6. Deploy!

#### Option 2: Railway

1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add a new service
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variables
7. Deploy!

#### Option 3: Cyclic

1. Go to [Cyclic](https://cyclic.sh)
2. Connect your GitHub repository
3. Select `backend` folder
4. Add environment variables
5. Deploy!

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-url.com
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@project.iam.gserviceaccount.com
NODE_ENV=production
PORT=5001
```

## Post-Deployment Steps

1. **Update CORS Origins**
   - Update backend CORS configuration with your frontend URL
   
2. **Test Your Deployment**
   - Try creating a bot
   - Upload a document
   - Test the chat widget
   - Check analytics

3. **Monitor Your App**
   - Set up error tracking (Sentry recommended)
   - Monitor performance
   - Check logs regularly

4. **Update README**
   - Add your live demo URL
   - Update screenshots with your deployment

## Free Tier Limits

### Vercel
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic SSL

### Render
- 750 hours/month (Free tier)
- Auto-sleep after 15 min inactivity
- 512 MB RAM

### Railway
- $5 free credit/month
- Pay as you go after

### MongoDB Atlas
- 512 MB storage (Free tier)
- Shared cluster
- No credit card required

## Troubleshooting

### Frontend not connecting to Backend
- Check CORS settings in backend
- Verify API URL in frontend .env
- Check browser console for errors

### Backend crashes on Render
- Check logs in Render dashboard
- Verify all environment variables
- Check MongoDB connection string

### Chat widget not loading
- Check embed code configuration
- Verify botId is correct
- Check network tab for CORS errors

## Security Best Practices

1. **Never commit .env files**
2. **Use environment variables** for all secrets
3. **Enable Firebase authentication** rules
4. **Set up MongoDB IP whitelist** (allow all for cloud platforms: 0.0.0.0/0)
5. **Use HTTPS** everywhere
6. **Regularly update dependencies**

## Monitoring & Maintenance

- Set up uptime monitoring (UptimeRobot, Pingdom)
- Enable error tracking (Sentry, LogRocket)
- Regular dependency updates
- Backup your MongoDB database
- Monitor API usage and costs

## Support

If you encounter issues during deployment:
1. Check the [GitHub Issues](https://github.com/pavankumar-vh/RAGHost/issues)
2. Join our community discussions
3. Read the troubleshooting guide

Happy Deploying! 🚀
