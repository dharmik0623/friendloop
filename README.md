# FriendLoop — Social Media Application

A scalable, real-time, AI-enhanced social networking platform designed to showcase full-stack engineering skills.

## Architecture

This project is separated into a Next.js `client` and a Node.js/Express `server`.
It uses PostgreSQL for relational data (the social graph), MongoDB for unstructured post content, and Redis for caching.

## Tech Stack
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Zustand/Redux
- **Backend**: Node.js, Express, Socket.io
- **Databases**: PostgreSQL, MongoDB, Redis
- **Infra**: Docker, Docker Compose

## 💻 Hardware & Software Requirements

### Hardware Requirements
- **Processor**: Multi-core CPU (e.g., Intel i5/AMD Ryzen 5 or better recommended for running multiple containers).
- **RAM**: Minimum 8GB (16GB recommended as Docker, Next.js, and Node.js are memory-intensive).
- **Storage**: At least 5GB of free disk space for dependencies and Docker images.

### Software Requirements
- **OS**: Windows 10/11, macOS, or Linux.
- **Node.js**: v18.0.0 or higher.
- **Docker & Docker Compose**: Required for spinning up the local PostgreSQL, MongoDB, and Redis databases.
- **Git**: For version control cloning.

## ✨ Detailed Features & How They Work

### 1. User Authentication (JWT)
- **What it does**: Allows users to securely register, log in, and maintain a session.
- **How it works**: When a user logs in, the Node.js API verifies credentials against the PostgreSQL database using `bcrypt`. A JSON Web Token (JWT) is signed and returned to the client, which stores it securely. Every subsequent request from the React frontend includes this token via an Axios interceptor to authenticate the user.

### 2. Social Graph & Networking
- **What it does**: Users can find friends, send friend requests, and curate their feed.
- **How it works**: Friendships are modeled relationally in **PostgreSQL**. The `friendships` table tracks the initiator, receiver, and request status (pending/accepted). Only posts from accepted friends (or the user's own posts) are aggregated when generating the main feed.

### 3. Rich Media Post Management
- **What it does**: Users can create posts containing text, images, and videos. They can also edit their post text or delete the post entirely.
- **How it works**: Posts are treated as unstructured documents and are saved in **MongoDB**. Media files are handled by the `multer` middleware on the Node.js server, saved directly to the host machine's `/uploads` folder, and served statically. When an author deletes a post, a backend mechanism immediately wipes the document from MongoDB and invalidates the **Redis** feed cache so the deleted post doesn't reappear on browser refresh.

### 4. Interactive Feed (Likes, Comments, Bookmarks)
- **What it does**: Users can interact with feed content and save items for later viewing.
- **How it works**: Arrays on the MongoDB Post document store exactly which users have liked or bookmarked a post. A dedicated `app/saved` page queries the backend specifically for posts containing the current user's ID in the `bookmarks` array, dynamically displaying a curated collection of saved items.

### 5. Real-Time Communication
- **What it does**: Users can instantly message their friends and see live "typing..." indicators.
- **How it works**: A bidirectional connection is established via **Socket.io**. The server tracks the socket IDs associated with authenticated user IDs. When User A types or sends a message, an event is emitted directly to User B's socket without writing to the database first, enabling instant UI updates.

### 6. Automated Smart Moderation
- **What it does**: Identifies and blocks inappropriate or spammy content from being posted.
- **How it works**: A mock AI service integration intercepts the post creation and edit routes. It scans the payload against a local pattern dictionary (or an external API) and halts the database injection if a violation is detected, returning a `403` status to the frontend.

## Quick Start

### 1. Start the Databases
Ensure Docker is running and run:
```bash
docker-compose up -d
```

### 2. Configure Environment variables
Copy `.env.example` to `.env` in both `client` and `server` directories and adjust values appropriately.

### 3. Start the Backend Server
```bash
cd server
npm install
npm run dev
```

### 4. Start the Frontend Application
```bash
cd client
npm install
npm run dev
```
