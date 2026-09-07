# QuickChat 💬

Real-time chat application built using the **PERN Stack** and **Socket.IO**.

## Features

- 🔐 User authentication using JWT
- 🔑 Password hashing using bcrypt
- 💬 Real-time one-to-one messaging
- 🟢 Online/offline user status
- 📩 Unseen message count
- ✓ Message seen status
- 👤 Profile management
- 🖼️ Image messages
- ☁️ Image upload using Cloudinary
- 🗄️ PostgreSQL database
- ⚡ Real-time communication using Socket.IO

## Tech Stack

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

### Database
- PostgreSQL
- pg

## PERN Stack

- **P** → PostgreSQL
- **E** → Express.js
- **R** → React
- **N** → Node.js

## Database

The PostgreSQL database schema is available in:

`server/schema.sql`

It contains:

- `users` table
- `messages` table

## Project Structure

```text
chat-app/
│
├── client/
│   ├── context/
│   ├── public/
│   └── src/
│
├── server/
│   ├── controllers/
│   ├── lb/
│   ├── middleware/
│   ├── routes/
│   ├── schema.sql
│   └── server.js
│
├── screenshots/
└── README.md
