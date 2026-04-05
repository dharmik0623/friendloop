# Testing Patterns

## Current State
No automated testing frameworks (Vitest, Jest) are currently initialized.

## Manual Verification
A browser-based audit is used to verify core flows (Auth, Feed, Messaging).

## Test Scripts
Mock testing scripts located in `server/*.js` use standard `fetch` or `node-fetch` to verify:
- `test_create_post.js`: Post creation flow.
- `test_feed.js`: Feed fetching and pagination.
- `test_query.js`: Generic database queries.

## Next Steps
- Implement **Vitest** for server-side logic (controllers, middleware).
- Use **Next.js Playwright** for automated E2E browser testing.

---
*Last updated: 2026-04-05 during codebase mapping*
