<div align="center">

# 🤖 RAGHost

### Enterprise-Grade RAG Chatbot Hosting Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Live Demo](https://img.shields.io/badge/Demo-Live-success.svg)](https://rag-host.vercel.app)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)
[![GitHub Stars](https://img.shields.io/github/stars/pavankumar-vh/RAGHost?style=social)](https://github.com/pavankumar-vh/RAGHost/stargazers)

**RAGHost** is a production-ready, open-source platform for creating, managing, and deploying AI-powered chatbots with Retrieval-Augmented Generation (RAG). Build intelligent chatbots that leverage your custom knowledge base with state-of-the-art AI models.

[Live Demo](https://rag-host.vercel.app) • [API Backend](https://raghost-pcgw.onrender.com/health) • [Documentation](#-documentation) • [Report Bug](https://github.com/pavankumar-vh/RAGHost/issues) • [Request Feature](https://github.com/pavankumar-vh/RAGHost/issues)

---

## 🌐 Live Deployments

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | [rag-host.vercel.app](https://rag-host.vercel.app) | ✅ Live |
| **Backend API** | [raghost-pcgw.onrender.com](https://raghost-pcgw.onrender.com/health) | ✅ Live |
| **Documentation** | In-app at `/docs` tab | ✅ Available |

</div>

---

## 📑 Table of Contents

- [✨ Key Features](#-key-features)
- [🎯 Use Cases](#-use-cases)
- [🏗️ Architecture](#️-architecture)
- [🚀 Tech Stack](#-tech-stack)
- [📋 Prerequisites](#-prerequisites)
- [🛠️ Installation](#️-installation)
- [⚙️ Configuration](#️-configuration)
- [🎯 Running the Application](#-running-the-application)
- [🚢 Deployment](#-deployment)
- [📊 API Documentation](#-api-documentation)
- [🎨 Widget Embed Templates](#-widget-embed-templates)
- [🎨 Customization](#-customization)
- [⚡ Performance](#-performance)
- [🔒 Security](#-security)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

---

## ✨ Key Features

### 🤖 **Multi-Bot Management**
- Create unlimited AI chatbots with unique configurations
- 14+ pre-configured bot templates (Support, Sales, HR, Healthcare, Legal, etc.)
- Smart template system with auto-fill functionality
- Individual API keys per bot for isolation

### 📚 **Intelligent Knowledge Base**
- Upload multiple document formats (PDF, TXT, DOCX, DOC)
- Automatic text extraction and chunking
- Vector embeddings with Pinecone
- Semantic search for accurate context retrieval
- Document management (view, delete, update)

### 🎨 **Beautiful & Customizable UI**
- Modern, responsive design with TailwindCSS
- 3 color themes: Pink, Yellow, Blue
- Smooth 60fps animations with hardware acceleration
- Slide-in panels for create/edit workflows
- Dark mode optimized interface

### 📊 **Advanced Analytics Dashboard**
- Real-time query tracking
- Response time monitoring
- Accuracy metrics
- Cost analysis per bot
- Daily/weekly/monthly trends
- Top performing bots
- Interactive MUI charts

### 🔐 **Enterprise Security**
- Firebase Authentication (Email/Password, Google OAuth ready)
- Encrypted API key storage (AES-256)
- JWT-based API authentication
- Rate limiting (DDoS protection)
- CORS configuration
- Helmet.js security headers
- Git pre-commit hooks for sensitive data

### 🌐 **Easy Website Integration**
- **8 professional widget templates** (Bubble, Sidebar, Inline, FAB, etc.)
- Copy-paste embed code generator
- Fully customizable chat widgets
- Responsive design for all devices
- Public API for chat interactions
- CORS-enabled for any domain
- Session management
- Chat history tracking

### ⚡ **Performance Optimized**
- Redis caching for faster responses
- Bull job queues for async processing
- MongoDB connection pooling (2-50 connections)
- Compression (gzip/brotli)
- Code splitting & lazy loading
- Vite build optimization
- 60fps UI animations

### 🎯 **Developer Friendly**
- Comprehensive API documentation
- Environment variable templates
- Interactive documentation page
- Error handling & validation
- ESLint configured
- Memory optimization modes

---

## 🎯 Use Cases

| Industry | Use Case | Bot Template |
|----------|----------|--------------|
| **E-Commerce** | Product recommendations, order tracking | 🛒 Shopping Assistant |
| **Healthcare** | Medical information, appointment booking | 🏥 Healthcare Info |
| **Education** | Learning assistance, homework help | 🎓 Educational Tutor |
| **HR** | Employee inquiries, policy information | 👥 HR Assistant |
| **Finance** | Banking queries, financial advice | 💰 Financial Advisory |
| **Travel** | Trip planning, destination recommendations | ✈️ Travel Planning |
| **Legal** | Legal information, resource guidance | ⚖️ Legal Information |
| **Real Estate** | Property search, listing inquiries | 🏠 Real Estate |
| **Restaurant** | Menu inquiries, reservation booking | 🍽️ Restaurant Booking |
| **Customer Support** | Technical issues, FAQs | 🎧 Support Bot |
| **Sales** | Lead qualification, product demos | 💼 Sales Assistant |
| **Documentation** | Technical docs, API references | 📚 Docs Assistant |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Dashboard   │  │  Bot Config  │  │  Analytics   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Chat Widget  │  │  Knowledge   │  │     Auth     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Node.js + Express)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Routes    │  │  Middleware  │  │ Controllers  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Rate Limiter │  │  Auth Guard  │  │ Compression  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┼───────┐
                    ▼       ▼       ▼
        ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
        │   MongoDB    │ │   Firebase   │ │    Redis     │
        │   (Atlas)    │ │    Auth      │ │  (Upstash)   │
        └──────────────┘ └──────────────┘ └──────────────┘
                    ▼       ▼
        ┌──────────────┐ ┌──────────────┐
        │   Pinecone   │ │ Google AI    │
        │   (Vectors)  │ │  (Gemini)    │
        └──────────────┘ └──────────────┘
```

### Data Flow

1. **User Query** → Frontend sends message to `/api/chat/:botId/message`
2. **Authentication** → Firebase JWT validation  
3. **Rate Limiting** → Check request limits
4. **Document Retrieval** → Query Pinecone for relevant context
5. **AI Processing** → Send context + query to Gemini AI
6. **Response** → Stream or return formatted response
7. **Analytics** → Log query metrics to MongoDB
8. **Cache** → Store frequent queries in Redis (optional)

---

## 🚀 Tech Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 18.2 |
| **Vite** | Build Tool & Dev Server | 5.4 |
| **TailwindCSS** | Styling Framework | 3.4 |
| **MUI X Charts** | Analytics Visualization | 7.x |
| **Axios** | HTTP Client | 1.6 |
| **React Router** | Client-side Routing | 6.x |
| **Lucide React** | Icon Library | Latest |
| **Firebase SDK** | Authentication | 10.x |

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime Environment | 18+ |
| **Express** | Web Framework | 4.18 |
| **MongoDB** | Database | Latest |
| **Mongoose** | ODM | 8.0 |
| **Firebase Admin** | Auth Verification | 12.0 |
| **Pinecone** | Vector Database | Latest |
| **Google AI** | LLM (Gemini 2.5 Flash) | Latest |
| **Redis** | Caching Layer | 7+ (Upstash) |
| **Bull** | Job Queue | 4.16 |
| **Multer** | File Upload | 2.0 |
| **PDF-Parse** | PDF Processing | 2.1 |
| **Mammoth** | DOCX Processing | 1.11 |
| **Helmet** | Security Headers | 7.1 |
| **Compression** | Response Compression | 1.8 |

### DevOps & Deployment
- **Vercel** - Frontend hosting
- **Render** - Backend hosting
- **MongoDB Atlas** - Database hosting
- **Upstash** - Redis hosting
- **Git Hooks** - Pre-commit security checks

---

## 📋 Prerequisites

Before you begin, ensure you have the following:

### Required Accounts
1. **MongoDB Atlas** - [Sign up](https://www.mongodb.com/cloud/atlas/register)
2. **Firebase** - [Create project](https://console.firebase.google.com/)
3. **Pinecone** - [Get API key](https://www.pinecone.io/)
4. **Google AI Studio** - [Get Gemini API key](https://makersuite.google.com/app/apikey)
5. **Upstash Redis** (Optional) - [Get Redis URL](https://upstash.com/)

### Software Requirements
```bash
Node.js >= 18.0.0
npm >= 9.0.0
Git >= 2.0.0
```

---

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/pavankumar-vh/RAGHost.git
cd RAGHost
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

---

## ⚙️ Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
# Server Configuration
PORT=5001
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority

# Encryption Key (Generate with: node scripts/generate-encryption-key.js)
ENCRYPTION_KEY=your_64_character_hex_key

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com

# CORS Configuration
CORS_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Performance Tuning
ENABLE_CLUSTERING=false
ENABLE_COMPRESSION=true
ENABLE_CACHING=true
ENABLE_LOW_MEMORY=false

# Redis (Optional - For caching and queues)
REDIS_URL=rediss://default:<password>@<host>:<port>
```

#### 🔧 Generate Encryption Key

```bash
cd backend
npm run generate-key
```

#### 🔥 Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → **Project Settings** → **Service Accounts**
3. Click **"Generate New Private Key"**
4. Copy the values to your `.env` file

### Frontend Environment Variables

Create `frontend/.env`:

```env
# API Configuration
VITE_API_URL=http://localhost:5001

# Firebase Client SDK
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

#### 🔥 Firebase Client Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project → **Project Settings** → **General**
3. Scroll to **"Your apps"** → Select Web App
4. Copy the config values to your `.env` file

---

## 🎯 Running the Application

### Development Mode

#### Start Backend (Terminal 1)
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:5001`

#### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5173`

### Production Build

#### Build Frontend
```bash
cd frontend
npm run build
```
Output in `frontend/dist/`

#### Start Backend (Production)
```bash
cd backend
npm start
```

For low memory environments (512MB):
```bash
npm run start:low-memory
```

---

## 🚢 Deployment

> **🌐 Current Live Deployments:**
> - Frontend: [rag-host.vercel.app](https://rag-host.vercel.app)
> - Backend: [raghost-pcgw.onrender.com](https://raghost-pcgw.onrender.com/health)

### Frontend Deployment (Vercel)

#### Option 1: Vercel CLI
```bash
cd frontend
npm install -g vercel
vercel --prod
```

**Example Output:**
```
✅ Deployed to production: https://rag-host.vercel.app
```

#### Option 2: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click **"Import Project"**
3. Select your GitHub repository
4. Set **Root Directory**: `frontend`
5. Set **Build Command**: `npm run build`
6. Set **Output Directory**: `dist`
7. Add environment variables from `frontend/.env`
8. Click **"Deploy"**

**Your app will be live at:** `https://your-project.vercel.app`

### Backend Deployment (Render)

#### Using Render Dashboard

1. Go to [render.com](https://render.com)
2. Click **"New +" → "Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `raghost-backend`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave blank
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free (512MB) or Starter (1GB+)

5. Add Environment Variables (see [RENDER_DEPLOYMENT_GUIDE.md](backend/RENDER_DEPLOYMENT_GUIDE.md))

6. Click **"Create Web Service"**

**Your API will be live at:** `https://your-service.onrender.com`

#### ⚠️ Memory Optimization for Render Free Tier

If deploying to Render Free (512MB), see [backend/MEMORY_OPTIMIZATION.md](backend/MEMORY_OPTIMIZATION.md)

**Quick Setup:**
```env
ENABLE_LOW_MEMORY=true
ENABLE_CACHING=false
```

And change Start Command to:
```bash
cd backend && npm run start:low-memory
```

---

## 📊 API Documentation

### Base URL
```
Development: http://localhost:5001
Production:  https://raghost-pcgw.onrender.com
Live Demo:   https://rag-host.vercel.app
```

> **Note:** The backend may take 30-60 seconds to wake up from sleep on Render's free tier.

### Authentication

All authenticated endpoints require Firebase JWT token:

```bash
Authorization: Bearer <firebase_jwt_token>
```

### Endpoints

#### 🤖 Bots Management

```http
GET    /api/bots              # Get all user bots
POST   /api/bots              # Create new bot
GET    /api/bots/:id          # Get bot details
PUT    /api/bots/:id          # Update bot
DELETE /api/bots/:id          # Delete bot
```

**Create Bot Request:**
```json
{
  "name": "Customer Support Bot",
  "type": "Support",
  "description": "Helps with technical issues",
  "color": "blue",
  "systemPrompt": "You are a helpful customer support agent...",
  "pineconeKey": "pcsk_xxxxx",
  "pineconeEnvironment": "https://index-xxx.svc.pinecone.io",
  "pineconeIndexName": "my-index",
  "geminiKey": "AIzaSy..."
}
```

#### 💬 Chat API (Public)

```http
POST   /api/chat/:botId/message      # Send message
GET    /api/chat/:botId/history/:sessionId   # Get history
```

**Send Message Request:**
```json
{
  "message": "How do I reset my password?",
  "sessionId": "unique-session-id-123"
}
```

**Response:**
```json
{
  "response": "To reset your password, follow these steps: 1. Click 'Forgot Password'...",
  "conversationId": "conv_123",
  "timestamp": "2025-10-08T12:34:56.789Z"
}
```

#### 📚 Knowledge Base

```http
POST   /api/knowledge/:botId/upload    # Upload documents
GET    /api/knowledge/:botId           # Get all documents
DELETE /api/knowledge/:botId/:docId    # Delete document
POST   /api/knowledge/:botId/:docId/reprocess  # Reprocess document
```

**Upload Document:**
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "documents=@file.pdf" \
  http://localhost:5001/api/knowledge/bot123/upload
```

#### 📊 Analytics

```http
GET /api/analytics/overview                 # Overview stats
GET /api/analytics/daily?days=30           # Daily analytics
GET /api/analytics/top-bots?limit=5        # Top performing bots
GET /api/analytics/bot/:botId?days=7       # Bot-specific analytics
```

#### 🔑 API Keys Management

```http
GET  /api/keys/:botId         # Get encrypted keys
POST /api/keys/:botId         # Update keys
```

#### 🌐 Widget

```http
GET  /api/widget/:botId/embed-code    # Get embed code
```

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| General API | 100 requests | 15 minutes |
| Chat API | 30 messages | 1 minute |
| Knowledge Upload | 50 uploads | 15 minutes |
| Auth | 10 attempts | 15 minutes |

### Error Responses

```json
{
  "success": false,
  "error": "Error message here",
  "code": "ERROR_CODE"
}
```

**Common Error Codes:**
- `INVALID_BOT_ID` - Bot not found
- `AUTHENTICATION_REQUIRED` - Missing or invalid token
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `DOCUMENT_PROCESSING_FAILED` - File upload error
- `AI_SERVICE_ERROR` - Gemini API error

---

## 🎨 Customization

### Adding New Bot Templates

Edit `frontend/src/components/BotConfigModal.jsx`:

```javascript
const botTemplates = {
  'YourType': {
    name: 'Your Bot Name',
    description: 'Bot description',
    systemPrompt: 'You are a helpful assistant...',
    color: 'blue'
  },
  // ... add more
};
```

### Changing Color Themes

Edit `frontend/tailwind.config.js`:

```javascript
colors: {
  accent: {
    pink: '#FF95DD',
    yellow: '#F6FF7F',
    blue: '#B7BEFE',
    custom: '#YOUR_COLOR'  // Add new color
  },
}
```

### Customizing Chat Widget

Edit `frontend/src/components/ChatWidget.jsx`:

```javascript
// Customize appearance
const widgetStyles = {
  primaryColor: '#FF95DD',
  botMessageBg: '#2D2D2D',
  userMessageBg: '#FF95DD',
  // ... more options
};
```

### Adding New AI Models

Edit `backend/routes/chat.js` to integrate new models:

```javascript
// Example: OpenAI integration
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: bot.openaiKey });
const completion = await openai.chat.completions.create({
  model: "gpt-4-turbo",
  messages: [{ role: "user", content: userMessage }],
});
```

---

## 🎨 Widget Embed Templates

RAGHost provides **8 professionally-designed widget templates** for embedding your chatbots on any website. Each template is fully functional, responsive, and customizable.

### Available Templates

| Template | Description | Best For |
|----------|-------------|----------|
| **🔵 Classic Bubble** | Traditional floating button in corner | E-commerce, Blogs, General websites |
| **📱 Fullscreen Sidebar** | Slide-in panel from right edge | Documentation, SaaS platforms |
| **✨ Minimal Popup** | Compact, elegant chat window | Landing pages, Portfolios |
| **⚡ Inline Embed** | Embedded directly in page content | Help centers, Support pages |
| **📊 Bottom Bar** | Full-width sticky footer that expands | Marketing sites, News portals |
| **🎯 Custom Styled** | CSS variables for brand matching | Enterprise sites with strict branding |
| **📱 Mobile Optimized** | Responsive design for mobile-first | Mobile apps, PWAs |
| **🎨 FAB Style** | Material Design floating action button | Modern web apps |

### How to Use Widget Templates

1. **Navigate to your bot** in the RAGHost dashboard
2. **Click "Get Embed Code"** button
3. **Select "Widget Templates" tab**
4. **Choose a template** that matches your design
5. **Copy the generated code**
6. **Paste before `</body>`** tag in your HTML

### Template Customization Options

Each template supports these configuration options:

```javascript
window.raghostConfig = {
  botId: 'your-bot-id',                         // Required: Your bot ID
  apiUrl: 'https://raghost-pcgw.onrender.com',  // Required: API endpoint
  botName: 'Support Bot',                       // Bot display name
  botType: 'Support',                           // Bot type
  color: 'pink',                                // Theme: pink, yellow, blue
  
  // Template-specific options
  position: 'bottom-right',          // Widget position
  width: '400px',                    // Custom width
  height: '600px',                   // Custom height
  theme: 'classic',                  // Template theme
  showAvatar: true,                  // Show bot avatar
  rippleEffect: true,                // Material ripple effect
  responsive: true,                  // Auto-adjust for mobile
  
  // Advanced customization
  customStyles: true,                // Enable CSS variables
  showCloseButton: true,             // Show close button
  expandable: true,                  // Allow expand/collapse
};
```

### CSS Customization

For the **Custom Styled** template, use CSS variables:

```css
:root {
  --raghost-primary-color: #FF95DD;
  --raghost-bg-color: #1F1F1F;
  --raghost-text-color: #FFFFFF;
  --raghost-border-radius: 16px;
  --raghost-shadow: 0 10px 40px rgba(0,0,0,0.3);
  --raghost-font-family: 'Inter', sans-serif;
}
```

### Example: E-commerce Website

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Store</title>
</head>
<body>
  <!-- Your website content -->
  
  <!-- RAGHost Widget - Classic Bubble -->
  <script>
    (function() {
      window.raghostConfig = {
        botId: 'abc123',
        apiUrl: 'https://raghost-pcgw.onrender.com',
        botName: 'Store Assistant',
        botType: 'Sales',
        color: 'pink',
        position: 'bottom-right',
        theme: 'classic'
      };
      var script = document.createElement('script');
      script.src = 'https://rag-host.vercel.app/widget.js';
      script.async = true;
      document.body.appendChild(script);
    })();
  </script>
</body>
</html>
```

### Example: Documentation Site

```html
<!-- RAGHost Widget - Fullscreen Sidebar -->
<script>
  (function() {
    window.raghostConfig = {
      botId: 'xyz789',
      apiUrl: 'https://raghost-pcgw.onrender.com',
      botName: 'Docs Assistant',
      botType: 'Documentation',
      color: 'blue',
      position: 'sidebar-right',
      width: '400px',
      theme: 'sidebar'
    };
    var script = document.createElement('script');
    script.src = 'https://rag-host.vercel.app/widget.js';
    script.async = true;
    document.body.appendChild(script);
  })();
</script>
```

### Mobile Responsiveness

All templates automatically adapt to mobile devices:
- **Desktop**: Full-featured chat widget
- **Tablet**: Adjusted sizing and positioning
- **Mobile**: Fullscreen modal for better UX

The **Mobile Optimized** template provides enhanced mobile experience with:
- Touch-friendly buttons
- Swipe gestures
- Auto-fullscreen on small screens
- Optimized keyboard handling

---

## ⚡ Performance

### Optimization Features

#### 🚀 Frontend Performance
- **60fps UI animations** with hardware acceleration
- **Code splitting** - React.lazy + dynamic imports
- **Lazy loading** - Images and components
- **Vite optimizations** - Terser minification, tree shaking
- **Tailwind purge** - Remove unused CSS
- **Bundle size** - ~200KB gzipped

#### 🔥 Backend Performance
- **Connection pooling** - 2-50 MongoDB connections
- **Redis caching** - Frequent query results
- **Compression** - gzip/brotli (70-90% reduction)
- **Rate limiting** - DDoS protection
- **Bull queues** - Async document processing
- **Memory modes** - Normal (600MB) or Low (300MB)

### Performance Benchmarks

| Metric | Value | Environment |
|--------|-------|-------------|
| **Initial Load** | 1.2s | First contentful paint |
| **API Response** | 150ms | Without AI processing |
| **Chat Response** | 2-4s | Including AI generation |
| **Document Upload** | 3-8s | Depending on size |
| **Memory Usage** | 300-800MB | Configurable |
| **Lighthouse Score** | 95+ | Performance |

### Scaling

**Horizontal Scaling:**
- Deploy multiple backend instances
- Use load balancer (nginx, AWS ELB)
- Redis for session storage
- MongoDB replica sets

**Vertical Scaling:**
- Increase server memory (512MB → 1GB → 2GB)
- Enable `ENABLE_CLUSTERING=true`
- Increase connection pool size
- Enable Redis caching

---

## 🔒 Security

### Implemented Security Measures

#### 🔐 Authentication & Authorization
- ✅ Firebase JWT verification
- ✅ Per-request token validation
- ✅ Role-based access (bot ownership)
- ✅ Session management

#### 🛡️ Data Protection
- ✅ AES-256 encryption for API keys
- ✅ Environment variable isolation
- ✅ Git hooks prevent sensitive commits
- ✅ Secure password hashing (Firebase)

#### 🚫 Attack Prevention
- ✅ Rate limiting (DDoS protection)
- ✅ CORS whitelist
- ✅ Helmet.js security headers
- ✅ Input validation & sanitization
- ✅ SQL injection prevention (Mongoose)
- ✅ XSS protection

#### 📝 Audit & Compliance
- ✅ Request logging
- ✅ Error tracking
- ✅ Analytics monitoring
- ✅ GDPR-ready (data export/deletion)

### Security Best Practices

1. **Rotate API Keys Regularly**
   ```bash
   # Update in database, not in code
   ```

2. **Use Environment Variables**
   ```bash
   # Never commit .env files
   # Use .env.example as template
   ```

3. **Enable Firebase Security Rules**
   ```javascript
   // Firestore rules
   match /bots/{botId} {
     allow read, write: if request.auth.uid == resource.data.userId;
   }
   ```

4. **Monitor Rate Limits**
   ```bash
   # Check logs for suspicious activity
   # Adjust limits in .env
   ```

5. **Keep Dependencies Updated**
   ```bash
   npm audit
   npm audit fix
   ```

### Reporting Security Issues

Found a security vulnerability? Please email: **security@yourproject.com**

Do not open public issues for security problems.

---

## 🤝 Contributing

We love contributions! ❤️

### How to Contribute

1. **Fork the repository**
   ```bash
   gh repo fork pavankumar-vh/RAGHost
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
   - Write clean, documented code
   - Follow existing code style
   - Add tests if applicable

4. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

   Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

5. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Describe your changes
   - Link related issues
   - Add screenshots if UI changes

### Development Guidelines

#### Code Style
- **JavaScript**: ES6+, async/await
- **React**: Functional components, hooks
- **Naming**: camelCase for variables, PascalCase for components
- **Files**: Descriptive names, one component per file

#### Commit Messages
```bash
feat: add new bot template
fix: resolve memory leak in chat
docs: update API documentation
style: format code with prettier
refactor: optimize database queries
test: add unit tests for auth
chore: update dependencies
```

#### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How did you test this?

## Screenshots
If applicable, add screenshots
```

### Contributors

<a href="https://github.com/pavankumar-vh/RAGHost/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=pavankumar-vh/RAGHost" />
</a>

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Pavan Kumar VH

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

This project wouldn't be possible without these amazing technologies:

- **[Google Gemini AI](https://ai.google.dev/)** - Powerful language models
- **[Pinecone](https://www.pinecone.io/)** - Vector database for semantic search
- **[Firebase](https://firebase.google.com/)** - Authentication and hosting
- **[MongoDB Atlas](https://www.mongodb.com/atlas)** - Cloud database
- **[Upstash](https://upstash.com/)** - Serverless Redis
- **[Vercel](https://vercel.com/)** - Frontend hosting
- **[Render](https://render.com/)** - Backend hosting
- **[React](https://reactjs.org/)** - UI framework
- **[TailwindCSS](https://tailwindcss.com/)** - Styling framework
- **[MUI](https://mui.com/)** - Chart components

### Special Thanks

- Contributors and community members
- Open-source maintainers
- Everyone who starred this project ⭐

---

## 📧 Contact

**Pavan Kumar VH**

- GitHub: [@pavankumar-vh](https://github.com/pavankumar-vh)
- Project: [RAGHost](https://github.com/pavankumar-vh/RAGHost)
- Live Demo: [rag-host.vercel.app](https://rag-host.vercel.app)

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=pavankumar-vh/RAGHost&type=Date)](https://star-history.com/#pavankumar-vh/RAGHost&Date)

---

## 📈 Project Stats

![GitHub repo size](https://img.shields.io/github/repo-size/pavankumar-vh/RAGHost)
![GitHub code size](https://img.shields.io/github/languages/code-size/pavankumar-vh/RAGHost)
![GitHub issues](https://img.shields.io/github/issues/pavankumar-vh/RAGHost)
![GitHub pull requests](https://img.shields.io/github/issues-pr/pavankumar-vh/RAGHost)
![GitHub last commit](https://img.shields.io/github/last-commit/pavankumar-vh/RAGHost)

---

<div align="center">

**Made with ❤️ by [Pavan Kumar VH](https://github.com/pavankumar-vh)**

If you found this project helpful, please consider giving it a ⭐!

[⬆ Back to Top](#-raghost)

</div>
