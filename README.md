# RAGHost 🤖

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)

**RAGHost** is a powerful, open-source RAG (Retrieval-Augmented Generation) chatbot hosting platform that allows you to create, manage, and deploy AI-powered chatbots with ease.

## ✨ Features

- 🤖 **Multiple Chatbots**: Create and manage multiple AI chatbots
- 📚 **Knowledge Base**: Upload documents (PDF, TXT, DOCX) for contextual responses
- 🎨 **Customizable UI**: Three color themes (Pink, Yellow, Blue)
- 📊 **Advanced Analytics**: Track queries, response times, accuracy, and costs
- 🔐 **Secure Authentication**: Firebase-based user authentication
- 🌐 **Easy Embedding**: Generate embed codes for your website
- 💾 **Vector Storage**: Pinecone integration for efficient semantic search
- 🧠 **AI-Powered**: Google Gemini 2.5 Flash for intelligent responses
- 📈 **Real-time Stats**: Daily analytics and performance tracking
- 🎯 **User-Friendly**: Intuitive dashboard for bot management

## 🚀 Tech Stack

### Frontend
- React 18.2
- Vite
- TailwindCSS
- MUI X Charts
- Axios
- React Router
- Lucide Icons

### Backend
- Node.js + Express
- MongoDB (Atlas)
- Firebase Admin SDK
- Pinecone Vector Database
- Google Generative AI (Gemini)
- PDF/Document Processing

## 📋 Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Firebase project
- Pinecone account
- Google AI Studio API key

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/pavankumar-vh/RAGHost.git
cd RAGHost
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in the backend directory:

```env
MONGODB_URI=your_mongodb_connection_string
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="your_private_key"
FIREBASE_CLIENT_EMAIL=your_client_email
PORT=5001
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:5001
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🎯 Running Locally

### Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on http://localhost:5001

### Start Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on http://localhost:5173

## 📦 Production Deployment

### Backend (Render/Railway)

1. Create a new web service
2. Connect your GitHub repository
3. Set build command: `cd backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variables from `.env.example`

### Frontend (Vercel/Netlify)

1. Import your repository
2. Set root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables

## 🎨 Usage

1. **Sign Up/Login**: Create an account or login with Firebase
2. **Create a Bot**: Click "Create New Bot" and configure settings
3. **Add Keys**: Configure Pinecone and Gemini API keys
4. **Upload Documents**: Add knowledge base documents
5. **Get Embed Code**: Copy the embed code for your website
6. **Monitor Analytics**: Track performance in the dashboard

## 📊 API Endpoints

### Authentication
- All authenticated routes require Firebase JWT token in Authorization header

### Bots
- `GET /api/bots` - Get all user bots
- `POST /api/bots` - Create new bot
- `PUT /api/bots/:id` - Update bot
- `DELETE /api/bots/:id` - Delete bot

### Chat
- `POST /api/chat/:botId/message` - Send message to bot (Public)
- `GET /api/chat/:botId/history/:sessionId` - Get chat history (Public)

### Knowledge Base
- `POST /api/knowledge/:botId/upload` - Upload documents
- `GET /api/knowledge/:botId` - Get all documents
- `DELETE /api/knowledge/:botId/:documentId` - Delete document

### Analytics
- `GET /api/analytics/overview` - Get overview analytics
- `GET /api/analytics/daily?days=30` - Get daily analytics
- `GET /api/analytics/top-bots?limit=5` - Get top performing bots

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for powerful language models
- Pinecone for vector database
- Firebase for authentication
- MongoDB Atlas for database hosting
- MUI for beautiful charts

## 📧 Contact

Pavan Kumar VH - [@pavankumar-vh](https://github.com/pavankumar-vh)

Project Link: [https://github.com/pavankumar-vh/RAGHost](https://github.com/pavankumar-vh/RAGHost)

## 🌟 Star History

If you find this project useful, please consider giving it a star! ⭐

## 📸 Screenshots

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)

### Bot Configuration
![Bot Config](docs/screenshots/bot-config.png)

### Analytics
![Analytics](docs/screenshots/analytics.png)

### Chat Widget
![Chat Widget](docs/screenshots/chat-widget.png)

---

Made with ❤️ by [Pavan Kumar VH](https://github.com/pavankumar-vh)
