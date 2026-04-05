# Project Structure

## Client Directory Structure (`client/src/`)
- `app/`: Next.js App Router (Layouts, pages, loading, error handlers).
- `components/`:
    - `shared/`: Common components (Navbar, Sidebar, SpidermanNotification).
    - `feed/`: Posting input, feed items.
    - `auth/`: Login/Register forms.
- `hooks/`: Custom React hooks (Auth context, post fetching).
- `services/`: Axios wrappers for API interaction.
- `store/`: Zustand state management (Auth, notifications).
- `utils/`: Common helpers (Date formatting, URL construction).

## Server Directory Structure (`server/src/`)
- `config/`: Configuration for PostgreSQL, MongoDB, and Redis.
- `api/`: API controllers and routes grouped by resource.
    - `friendships/`: Social graph logic.
    - `posts/`: Content creation and interaction.
    - `users/`: Authentication and identity.
- `middleware/`: Express middlewares (Auth, validation, AI moderation).
- `interfaces/`: TypeScript definitions.
- `sockets/`: Socket.io event handlers for real-time features.
- `uploads/`: Static media hosting for posts.

## Naming Conventions
- **Files**: PascalCase for React components, camelCase for services/utils/hooks.
- **Variables**: camelCase throughout TypeScript.
- **API Routes**: Resource-based (e.g., `/api/posts`, `/api/users/profile`).

---
*Last updated: 2026-04-05 during codebase mapping*
