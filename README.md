# QuickChat 💬

A real-time one-to-one chat application built using the **PERN Stack**, **Socket.IO**, **Gemini AI**, and **GIPHY**.

QuickChat allows users to communicate in real time with text, images, and GIFs, while also providing AI-powered chat assistance and smart reaction suggestions.

---

## ✨ Features

### 🔐 Authentication
- User signup and login
- JWT-based authentication
- Password hashing using bcrypt
- Protected API routes

### 💬 Real-Time Messaging
- One-to-one messaging
- Real-time message delivery using Socket.IO
- Online/offline user status
- Unseen message count
- Message seen status

### 🖼️ Media Messaging
- Send image messages
- Upload images using Cloudinary
- Send GIFs directly in conversations
- GIFs are stored as message data in PostgreSQL

### 🤖 Gemini AI Features
- AI Chat assistant
- AI-powered reply suggestions
- Generate three natural reply suggestions for a message
- AI-powered reaction search
- Gemini understands the emotion and context of a message
- Generates a suitable GIF search phrase

### 🎭 GIF & Sticker Reactions
- Search GIFs using GIPHY
- AI-generated search phrases based on conversation context
- Browse multiple GIF results
- Select and send a GIF
- Real-time GIF delivery through Socket.IO
- GIPHY attribution included

### 👤 Profile
- Update profile information
- Profile picture
- Bio

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- Axios
- React Router
- Tailwind CSS
- Socket.IO Client

### Backend

- Node.js
- Express.js
- Socket.IO
- JWT
- bcryptjs
- Cloudinary
- Google Gemini API

### Database

- PostgreSQL
- pg

### External APIs & Services

- Google Gemini API
- GIPHY API
- Cloudinary

---

## 🏗️ PERN Stack

QuickChat uses the **PERN Stack**:

- **P** → PostgreSQL
- **E** → Express.js
- **R** → React
- **N** → Node.js

Additional technologies:

- Socket.IO
- Gemini AI
- GIPHY
- Cloudinary
- JWT

---

## 📂 Project Structure

```text
chat-app/
│
├── client/
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ChatContext.jsx
│   │
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── AIChat.jsx
│       │   ├── ChatContainer.jsx
│       │   ├── Sidebar.jsx
│       │   └── ...
│       │
│       └── pages/
│
├── server/
│   ├── controllers/
│   │   ├── aiController.js
│   │   ├── messageController.js
│   │   └── ...
│   │
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   └── ...
│   │
│   ├── middleware/
│   ├── lb/
│   ├── schema.sql
│   └── server.js
│
├── screenshots/
├── .gitignore
└── README.md
