# System Architecture

## Overview
FriendLoop follows a **Full-Stack Managed Multi-Database Architecture**. It separates the social graph (relational) from content (unstructured) and performance (caching).

## System Patterns
- **Separated Services**: Client (Next.js) and Server (Express).
- **Relational Social Graph**: PostgreSQL tracks user identity and friendship statuses.
- **Unstructured Content**: MongoDB stores posts, comments, and messages.
- **Cache-Aside Caching**: Redis caches the user's feed for high-performance delivery.
- **Real-Time Layer**: Socket.io provides bidirectional messaging and live event notifications.

## Data Flow
1.  **Auth**: Client → Express (JWT) → PostgreSQL (User verification).
2.  **Post Creation**: Client → Express → MongoDB (Persistence) → Redis (Cache invalidation).
3.  **Feed Retrieval**: Client → Express → Redis (Check cache) → Falls back to MongoDB/PostgreSQL → Redis (Update cache) → Client.
4.  **Real-time notifications**: Express → Socket.io → Client.

## Security
- **JWT Authentication**: Secured routes and state.
- **Bcrypt Hashing**: Password security in PostgreSQL.
- **AI Moderation**: Mid-request interception of post/edit payloads via a mock AI service.

---
*Last updated: 2026-04-05 during codebase mapping*
