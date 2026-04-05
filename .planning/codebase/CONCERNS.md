# Technical Concerns

## Critical Areas
- **Real-Time Consistency**: Socket.io events are fired before database persistence (performance optimization), which may lead to out-of-sync UIs if database operations fail.
- **Cache Invalidation**: Redis keys are currently managed via simple invalidation after writes. Complex scenarios (e.g., individual post edits appearing in multi-user feeds) require a robust invalidation strategy.

## Tech Debt
- **Missing Automated Tests**: No Unit or E2E tests are currently in use beyond simple mock scripts.
- **AI Moderation (Mock)**: The AI moderation interceptor is currently a mock service. A production-ready solution (e.g., Gemini API implementation) is needed.
- **Profile Configuration**: User profile visibility toggles are initialized in the database but have limited UI controls.

## Known Fragilities
- **File Uploads**: `multer` saves to local storage (`/uploads`). This is not horizontally scalable without a shared storage volume or S3 bucket.
- **Socket ID Mapping**: Current Socket ID mapping is stored in memory on the Express server. Server restarts clear active socket sessions.

---
*Last updated: 2026-04-05 during codebase mapping*
