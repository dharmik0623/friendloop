# Technology Stack

## Core
- **Runtime**: Node.js v18+
- **Frontend Framework**: Next.js 16.1.6 (App Router)
- **Backend Framework**: Express 5.2.1
- **Language**: TypeScript (v5 in client, v5.9 in server)
- **Styling**: Tailwind CSS v4, Framer Motion (v12)

## Databases
- **Relational**: PostgreSQL 15 (Relational social graph: users, friendships)
- **Document**: MongoDB 6 (Unstructured content: posts, comments, messages)
- **Caching**: Redis 7 (Feed caching, session management)

## Key Dependencies
### Client
- `axios` (v1.13.6) - HTTP client
- `zustand` (v5.0.12) - State management
- `socket.io-client` (v4.8.3) - Real-time communication
- `lucide-react` (v0.577.0) - Icon library

### Server
- `mongoose` (v9.2.3) - MongoDB ODM
- `pg` (v8.19.0) - PostgreSQL client
- `redis` (v5.11.0) - Redis client
- `socket.io` (v4.8.3) - Real-time server
- `multer` (v2.1.1) - File upload handling
- `bcryptjs` (v3.0.3) - Hashing
- `jsonwebtoken` (v9.0.3) - Auth tokens
- `nodemon` (v3.1.14) - Dev server watch
- `ts-node` (v10.9.2) - TypeScript execution

## Configuration
- **Server Environment**: `.env` (Port 5000)
- **Client Environment**: `.env.local` (Next.js config)
- **Infrastructure**: `docker-compose.yml` (Databases)

---
*Last updated: 2026-04-05 during codebase mapping*
