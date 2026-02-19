# RAGHost

<div align="center">

**Production-ready RAG chatbot platform — build, embed, and manage AI-powered bots with your own knowledge base.**

Optional **Redis (Upstash)** integration ships out of the box — set `REDIS_URL` and three Bull queues (chat, embedding, analytics) start automatically alongside `getCachedData` / `setCachedData` caching helpers. No Redis? The app runs fully synchronously, nothing breaks. AES-256 encrypted key storage, Firebase JWT auth, and a full neo-brutalism dashboard — ready to deploy to Vercel + Render in under 10 minutes.

[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-rag--host.vercel.app-brightgreen)](https://rag-host.vercel.app)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
[![Production Ready](https://img.shields.io/badge/Production-Ready-brightgreen.svg)](https://rag-host.vercel.app)
[![Redis](https://img.shields.io/badge/Redis-Upstash-red.svg)](https://upstash.com/)
[![Built for Scale](https://img.shields.io/badge/Built%20for-Scale-blue.svg)](https://github.com/pavankumar-vh/RAGHost)

[Live Demo](https://rag-host.vercel.app) · [Report Bug](https://github.com/pavankumar-vh/RAGHost/issues) · [Request Feature](https://github.com/pavankumar-vh/RAGHost/issues)

</div>

---

## Live Deployments

| Service | URL | Status |
|---------|-----|--------|
| **Frontend** | [rag-host.vercel.app](https://rag-host.vercel.app) | Vercel |
| **Backend API** | [raghost-pcgw.onrender.com](https://raghost-pcgw.onrender.com/health) | Render |

> The backend may take 30–60 seconds to wake from sleep on Render's free tier.

---

## Screenshots

<div align="center">

| Dashboard | Bot Configuration |
|:---------:|:-----------------:|
| ![Dashboard Overview](media/images/01.png) | ![Bot Configuration](media/images/02.png) |
| *Manage all your AI bots from one place* | *Powerful bot setup with templates* |

| Knowledge Base | Widget Customizer V2 |
|:--------------:|:-------------------:|
| ![Knowledge Base](media/images/03.png) | ![Widget Customizer](media/images/04.png) |
| *Upload & manage documents for RAG* | *Live-preview widget with 9 customisation tabs* |

| Analytics Dashboard | Embed & Deploy |
|:-------------------:|:--------------:|
| ![Analytics](media/images/05.png) | ![Embed Code](media/images/06.png) |
| *Real-time metrics & performance tracking* | *One-click embed code for any website* |

</div>

---

## Table of Contents

- [Screenshots](#screenshots)
- [What is RAGHost?](#what-is-raghost)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## What is RAGHost?

RAGHost is a full-stack platform for building and deploying Retrieval-Augmented Generation (RAG) chatbots. Upload documents (PDF, TXT, DOCX, Markdown), connect your Pinecone index and Gemini API key, and get an embeddable chat widget you can drop on any website in seconds.

**No infra management required** — deploy the frontend to Vercel and the backend to Render with the included config files.

**Redis support built-in (optional)** — `backend/config/redis.js` exposes `getCachedData` / `setCachedData` / `deleteCachedData` helpers with exponential-backoff reconnect. When `REDIS_URL` is set, three Bull queues (chat-processing, embedding-processing, analytics-processing) initialise automatically for background job offloading. Without it the app falls back to synchronous processing with zero config — add a free [Upstash](https://upstash.com/) instance whenever you need the async layer.

---

## Features

### Bot Management
- Create multiple bots, each with its own knowledge base, system prompt, color theme, and API keys
- Per-bot Pinecone + Gemini key storage (AES-256 encrypted at rest)
- Collapsible sidebar dashboard — toggle between full and icon-only modes, state persisted across sessions

### Knowledge Base
- Upload PDF, TXT, DOCX, and Markdown files per bot
- Documents chunked, embedded, and stored in your Pinecone index
- Live upload progress tracking; reprocess or delete individual documents

### Chat Widget Embed
- Copy-paste HTML, React, Vue, or Vanilla JS embed snippets directly from the dashboard
- Cloud-backed embed code version history (stored in MongoDB, restore any previous version)
- A/B test copy generator — generate and compare multiple widget headline variants
- Widget config options: `botName`, `color`, `position`, `width`, `height`, `showAvatar`, `responsive`, and more

### Analytics Dashboard
- Per-bot and global message count, session count, and user metrics
- Activity over time visualized with Chart.js line charts
- Top-performing bots leaderboard

### User Profile
- Edit display name and avatar (12 gradient presets)
- Preferences synced to MongoDB
- Account security — change Firebase password from within the app
- Danger zone — full account deletion

### Performance & Scaling
- **Redis caching layer** (`config/redis.js`) — `getCachedData` / `setCachedData` / `deleteCachedData` / `deleteCachedPattern` helpers; graceful fallback when Redis is unavailable so the rest of the app is unaffected
- **Three Bull queues** initialised on startup when `REDIS_URL` is present: `chat-processing` (50 jobs/s, 3 retries), `embedding-processing` (async document embedding), `analytics-processing` (non-blocking metric writes)
- Both features are **opt-in** — omit `REDIS_URL` to run fully synchronously; set it to unlock the async layer
- MongoDB connection pooling (2–50 connections), gzip/brotli compression, code-split React bundles (~200 KB gzipped)
- Configurable low-memory mode (`ENABLE_LOW_MEMORY=true`) for 512 MB Render free tier

### Security & Auth
- Firebase Authentication (email/password)
- Password visibility toggle on all auth forms
- Rate limiting, Helmet.js headers, CORS whitelist, input sanitization
- AES-256 encryption for stored API keys

### Developer Experience
- Built-in 6-tab documentation view in the dashboard (Quick Start / Widget / API / Config / Examples / Help)
- FAQ accordion with common troubleshooting answers
- Terminal-style code blocks for all integration examples

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2 | UI framework |
| Vite | 5.x | Build tool |
| TailwindCSS | 3.x | Styling (neo-brutalism design system) |
| react-chartjs-2 + Chart.js | 5.x / 4.x | Analytics charts |
| Lucide React | latest | Icons |
| Firebase SDK | 10.x | Authentication client |
| React Router | 6.x | Client-side routing |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 4.x | HTTP server |
| MongoDB / Mongoose | 7.x | Primary database |
| Firebase Admin SDK | 12.x | JWT verification |
| Pinecone SDK | latest | Vector search |
| Google Gemini AI | latest | LLM + embeddings |
| Multer | 1.x | File uploads |
| pdf-parse + Mammoth | latest | Document parsing |
| Helmet + Compression | latest | Security & performance |
| **Redis (Upstash)** | 7+ | Session caching, rate-limit state, Bull queue backend |
| **Bull** | 4.x | Async job queues (document processing) |

---

## Architecture

```
+------------------------------------------------------------------+
|                         RAGHost Platform                         |
|                                                                  |
|  +-----------------+    +----------------------------------+     |
|  |   Frontend      |    |         Backend (Express)        |     |
|  |  React + Vite   |<-->|                                  |     |
|  |  TailwindCSS    |    |  +----------+  +-------------+  |     |
|  |                 |    |  |   Auth   |  |  Knowledge  |  |     |
|  |  Dashboard      |    |  |(Firebase)|  |   Base API  |  |     |
|  |  Chat Widget    |    |  +----------+  +-------------+  |     |
|  |  Analytics      |    |  +----------+  +-------------+  |     |
|  |  Documentation  |    |  |   Bot    |  |    Chat     |  |     |
|  +-----------------+    |  | Manager  |  |    API      |  |     |
|                         |  +----------+  +-------------+  |     |
|  +-----------------+    +----------------------------------+     |
|  |  Embed Widget   |              |           |                  |
|  |  (Any Website)  |    +---------v---+ +-----v--------------+  |
|  +-----------------+    |   MongoDB   | |  Vector Database   |  |
|                         |  (Atlas)    | |   (Pinecone)       |  |
|                         +-------------+ +--------------------+  |
|                                               |                  |
|                                    +----------v----------+       |
|                                    |    Google Gemini AI |       |
|                                    |  (LLM + Embeddings) |       |
|                                    +---------------------+       |
+------------------------------------------------------------------+
```

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB Atlas** account (free tier works)
- **Firebase** project with Authentication enabled
- **Pinecone** account and index
- **Google Gemini API** key

### Installation

```bash
# Clone the repository
git clone https://github.com/pavankumar-vh/RAGHost.git
cd RAGHost

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

---

## Environment Variables

### Backend — `backend/.env`

```env
NODE_ENV=development
PORT=5001

MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/raghost

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Generate with: npm run generate-key
ENCRYPTION_KEY=your-64-char-hex-key

# Comma-separated allowed origins
CORS_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

ENABLE_COMPRESSION=true
ENABLE_LOW_MEMORY=false

# Redis (optional) — enables Bull queues + caching helpers when set
# Get a free URL from https://upstash.com/ (format: rediss://default:<pw>@<host>:<port>)
# Omit entirely to run synchronously without cache
REDIS_URL=
```

#### Generate encryption key

```bash
cd backend && npm run generate-key
```

#### Firebase service account

1. [Firebase Console](https://console.firebase.google.com/) → Project Settings → Service Accounts
2. Click **Generate New Private Key** and copy values to `.env`

---

### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5001

VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

Get values from Firebase Console → Project Settings → General → Your Apps.

---

## Running the App

### Development

```bash
# Terminal 1 — Backend (http://localhost:5001)
cd backend && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend && npm run dev
```

### Production

```bash
cd frontend && npm run build   # output: frontend/dist/
cd backend && npm start        # or npm run start:low-memory for 512 MB
```

---

## Deployment

### Frontend — Vercel

```bash
cd frontend && npx vercel --prod
```

Or use the dashboard: import repo → Root Directory `frontend` → Build `npm run build` → Output `dist` → add `VITE_*` env vars → Deploy.

### Backend — Render

New Web Service → connect repo → Build: `cd backend && npm install` → Start: `cd backend && npm start` → add env vars → Deploy.

**Free tier (512 MB):** set `ENABLE_LOW_MEMORY=true` and start with `cd backend && npm run start:low-memory`.

---

## API Reference

### Base URLs

```
Development:  http://localhost:5001
Production:   https://raghost-pcgw.onrender.com
```

### Auth header

```
Authorization: Bearer <firebase_jwt_token>
```

### Endpoints

```http
# Bots
GET    /api/bots
POST   /api/bots
GET    /api/bots/:id
PUT    /api/bots/:id
DELETE /api/bots/:id

# Chat (public)
POST /api/chat/:botId/message
GET  /api/chat/:botId/history/:sessionId

# Knowledge Base
POST   /api/knowledge/:botId/upload
GET    /api/knowledge/:botId
DELETE /api/knowledge/:botId/:docId
POST   /api/knowledge/:botId/:docId/reprocess

# Analytics
GET /api/analytics/overview
GET /api/analytics/daily?days=30
GET /api/analytics/top-bots?limit=5
GET /api/analytics/bot/:botId?days=7

# Keys
GET  /api/keys/:botId
POST /api/keys/:botId

# Widget
GET /api/widget/:botId/embed-code
```

### Rate limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| General API | 100 req | 15 min |
| Chat | 30 msg | 1 min |
| Knowledge upload | 50 uploads | 15 min |
| Auth | 10 attempts | 15 min |

### Error format

```json
{ "success": false, "error": "message", "code": "ERROR_CODE" }
```

---

## Security

| Layer | Implementation |
|-------|---------------|
| Authentication | Firebase JWT, per-request validation |
| API key storage | AES-256 encryption |
| Transport | HTTPS + HSTS (Helmet.js) |
| Rate limiting | Per-IP on all endpoints |
| CORS | Explicit whitelist only |
| Input | Schema validation + sanitization |
| XSS / injection | Helmet headers + Mongoose ODM |

---

## Contributing

1. Fork → `git checkout -b feat/your-feature`
2. Commit: `git commit -m "feat: add X"` ([Conventional Commits](https://www.conventionalcommits.org/))
3. Push → open Pull Request

**Commit types:** `feat` · `fix` · `docs` · `style` · `refactor` · `test` · `chore`

<a href="https://github.com/pavankumar-vh/RAGHost/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=pavankumar-vh/RAGHost" />
</a>

---

## License

MIT — see [LICENSE](LICENSE).

---

## Contact

**Pavan Kumar VH** · [@pavankumar-vh](https://github.com/pavankumar-vh) · [rag-host.vercel.app](https://rag-host.vercel.app)

---

## Acknowledgments

[Google Gemini AI](https://ai.google.dev/) · [Pinecone](https://www.pinecone.io/) · [Firebase](https://firebase.google.com/) · [MongoDB Atlas](https://www.mongodb.com/atlas) · [Vercel](https://vercel.com/) · [Render](https://render.com/) · [Chart.js](https://www.chartjs.org/) · [TailwindCSS](https://tailwindcss.com/)

---

<div align="center">Made with ❤️ by <a href="https://github.com/pavankumar-vh">Pavan Kumar VH</a> &nbsp;·&nbsp; <a href="#raghost">⬆ Back to Top</a></div>
