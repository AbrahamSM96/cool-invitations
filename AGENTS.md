<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project

- Architecture and decisions: `ARCHITECTURE.md`.
- Package manager: **Bun** (`bun add`, `bun run`).
- Before finishing a change, run `bun run check` (type-aware oxlint + oxfmt + TypeScript 7).
- No ESLint or Prettier: lint rules live in `.oxlintrc.json`, formatting in `.oxfmtrc.json`.
- **Language:** all code comments, JSDoc, identifiers and commit messages are in **English**. User-facing UI text (invitations, CMS labels, metadata) stays in **Spanish**.
