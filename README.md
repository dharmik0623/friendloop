# 🌀 FriendLoop — Modern Real-Time Social Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.1-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.18-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?style=for-the-badge&logo=redis)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

FriendLoop is a full-stack, real-time, AI-enhanced social networking web application built with modern web technologies. It features dynamic feed feeds, rich media sharing, live bidirectional messaging, intelligent content moderation, and multi-database persistence optimized for speed and scaling.

---

## 📑 Table of Contents
- [Architecture Overview](#-architecture-overview)
- [Tech Stack](#-tech-stack)
- [Key Features](#-key-features)
- [System Requirements](#-system-requirements)
- [Project Structure](#-project-structure)
- [Environment Configuration](#-environment-configuration)
- [Getting Started](#-getting-started)
- [API Overview](#-api-overview)
- [License & Author](#-license--author)

---

## 🏗️ Architecture Overview

FriendLoop uses a hybrid database strategy:
- **PostgreSQL**: Manages structured relational data (Users, Auth, Social Graph, Friendships).
- **MongoDB**: Handles unstructured media-rich content (Posts, Comments, Likes, Bookmarks).
- **Redis**: Caching layer for high-throughput feed caching and active session state.

```mermaid
flowchart TD
    subgraph Client ["Frontend (Next.js 15 App Router)"]
        UI[React UI / Tailwind CSS]
        State[Zustand State Store]
        SocketClient[Socket.io Client]
    end

    subgraph Server ["Backend (Node.js & Express API)"]
        API[Express REST API Controller]
        Auth[JWT Middleware]
        Mod[AI Content Moderation Service]
        SocketServer[Socket.io Real-Time Engine]
    end

    subgraph DataLayer ["Data & Persistence Layer"]
        PG[(PostgreSQL - Social Graph & Auth)]
        Mongo[(MongoDB - Posts & Comments)]
        RedisCache[(Redis - Feed Cache)]
    end

    UI -->|HTTP Requests / Axios| API
    UI <-->|Bidirectional Websockets| SocketServer
    API --> Auth
    API --> Mod
    API --> PG
    API --> Mongo
    API <--> RedisCache
```

---

## 💻 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router, Server Components)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide Icons
- **State Management**: Zustand
- **Real-Time Client**: Socket.io-client

### Backend
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Real-Time Engine**: Socket.io
- **ORM / ODM**: Prisma / Mongoose / Native Drivers
- **Authentication**: JWT & Bcrypt

### Data & Infrastructure
- **Relational DB**: PostgreSQL
- **Document DB**: MongoDB
- **In-Memory Cache**: Redis
- **Containerization**: Docker & Docker Compose

---

## ✨ Key Features

| Feature | Description | Technical Implementation |
|---|---|---|
| 🔐 **User Authentication** | Secure registration, login, token management, and session guard. | JWT with HttpOnly storage capabilities & password hashing via Bcrypt. |
| 👥 **Social Graph & Friends** | Friend requests, approval workflows, mutual connections, and suggestions. | Relational `friendships` schema in PostgreSQL with status states (`pending`, `accepted`). |
| 📸 **Rich Media Posting** | Create, edit, delete posts with images, text, and rich formatting. | MongoDB document storage with `multer` disk storage service. |
| ❤️ **Interactions & Bookmarks** | Real-time likes, dynamic commenting, and post saving. | Atomic update operations on MongoDB array fields (`likes`, `bookmarks`). |
| 💬 **Instant Messaging** | Real-time direct messaging with typing indicators and online badges. | Bidirectional WebSocket communication powered by Socket.io. |
| 🛡️ **AI Content Moderation** | Automated filter detecting toxic or inappropriate text before saving. | Pipeline interceptor analyzing content against toxicity guidelines. |

---

## 📁 Project Structure

```
friendloop1/
├── client/                     # Next.js Frontend Application
│   ├── src/
│   │   ├── app/                # App Router Pages (Feed, Messages, Profile, Saved)
│   │   ├── components/         # Reusable UI components & modals
│   │   ├── lib/                # API client helpers & socket connectors
│   │   └── store/              # Zustand global state management
│   └── package.json
├── server/                     # Node.js Express Backend API
│   ├── src/
│   │   ├── api/                # Controllers & Routes (Auth, Posts, Friends, Chat)
│   │   ├── config/             # DB Connections (PG, Mongo, Redis)
│   │   ├── middleware/         # Auth verification & file uploaders
│   │   └── services/           # AI Moderation & Socket event handlers
│   └── package.json
├── docker-compose.yml          # Container configuration for DBs
├── Start_Servers.bat           # Windows quick-start runner script
└── README.md
```

---

## ⚙️ Environment Configuration

Create `.env` files in both the `client/` and `server/` directories based on the example templates:

### Backend (`server/.env`)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/friendloop
MONGODB_URI=mongodb://localhost:27017/friendloop
REDIS_URL=redis://localhost:6379
```

### Frontend (`client/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have installed:
- [Node.js (v18+)](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/friendloop.git
cd friendloop
```

### 2. Start the Databases (Docker)
Spin up PostgreSQL, MongoDB, and Redis in isolated containers:
```bash
docker-compose up -d
```

### 3. Install & Run Backend Server
```bash
cd server
npm install
npm run dev
```
The server will run on `http://localhost:5000`.

### 4. Install & Run Frontend Client
In a new terminal:
```bash
cd client
npm install
npm run dev
```
The client will launch on `http://localhost:3000`.

---

## 🔗 GitHub Upload Instructions

If you haven't published this repository to your GitHub account yet, follow these simple steps:

1. **Create a new repository on GitHub**:
   - Go to [GitHub New Repository](https://github.com/new).
   - Name it `friendloop` (or your preferred name).
   - Do **NOT** check "Initialize with README" or `.gitignore` (as they are already in this repo).

2. **Connect local repo to GitHub & push**:
   Run the following commands in your project root terminal:
   ```bash
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/friendloop.git
   git push -u origin main
   ```
   *(Replace `YOUR_USERNAME` with your actual GitHub username).*

---

## 📜 License & Author

Developed by **[Dharmik](https://github.com/dharmik0623)**. Built for performance, scalability, and modern UX standards.
