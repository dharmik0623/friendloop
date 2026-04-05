# Coding Conventions

## Styles and Standards
- **Linter**: ESLint (v9) with Next.js configuration.
- **Formatter**: Prettier (Default).
- **TypeScript**: Strict mode enabled in `tsconfig.json`.

## Code Patterns
- **React Components**: Functional components with TypeScript interfaces for props.
- **State Management**: Zustand for global auth and notifications.
- **Hooks**: Custom hooks for reusable logic (fetching feed, managing socket connections).
- **API Responses**: Standard JSON output with appropriate error statuses.
- **Error Handling**: Try-catch blocks in async actions, centralized middleware in server.

## Testing
- **Manual Verification**: Features are verified manually via the browser.
- **Unit/Integration**: No formalized unit tests (Jest/Vitest) detected in `package.json`.
- **Scripts**: Dummy test files (`test_create_post.js`, `test_feed.js`) use Node.js to fire API requests.

---
*Last updated: 2026-04-05 during codebase mapping*
