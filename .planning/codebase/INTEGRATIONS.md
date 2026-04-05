# Integrations

## Frontend Integrations
- **API (Axios)**: `baseURL` points to `http://localhost:5000/api`. Correctness ensured by Axios interceptors for JWT.
- **Socket.io-Client**: `socket.io-client` handles real-time messaging and notifications. Uses `NEXT_PUBLIC_SOCKET_URL`.

## Backend Integrations
- **PostgreSQL**: Relational database for Users and Social Graph. Port `5432`.
- **MongoDB**: Document database for Posts, Comments, and Messages. Port `28017`.
- **Redis**: Caching and Session management. Port `6379`.
- **Multer**: Multi-part form data processing for file uploads (`/uploads`).
- **AI Moderation (Mock)**: Mid-request processing for content filtering.

---
*Last updated: 2026-04-05 during codebase mapping*
