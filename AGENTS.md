# Repository Guidelines

## Project Structure & Module Organization
The app follows Next.js App Router conventions under `src/app`. Entry points live in `layout.tsx` and `page.tsx`, while global styles are defined in `globals.css`. Static assets belong in `public/`, and configuration lives at the repo root (`next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `tsconfig.json`). Keep feature-specific modules co-located within their route segments to simplify ownership and routing.

## Build, Test, and Development Commands
- `npm install` – install dependencies; rerun after editing `package.json`.
- `npm run dev` – start the local dev server with Turbopack and hot reload.
- `npm run build` – generate the optimized production bundle.
- `npm run start` – serve the production build locally for smoke checks.
- `npm run lint` – run ESLint with the Next.js ruleset; treat warnings as blockers.
Run commands from the repository root.

## Coding Style & Naming Conventions
TypeScript and React 19 are the defaults. Favor functional components and hooks. Use PascalCase for component files (`HomeHero.tsx`), camelCase for utilities, and kebab-case for asset names. Indent with two spaces, matching the existing formatting. Tailwind CSS is available via `globals.css`; prefer utility classes over ad-hoc styles, and encapsulate reusable patterns with small composable components.

## Testing Guidelines
Automated testing is not yet wired up. When adding tests, colocate them beside the implementation (e.g., `src/app/(feature)/Foo.spec.tsx`) and favor React Testing Library plus Vitest or Jest. Mock network requests and include accessibility assertions. Document new test commands in `package.json` and update this guide once coverage expectations are defined.

## Commit & Pull Request Guidelines
History currently contains the initial scaffold commit, so establish discipline going forward. Keep commits small, with imperative subject lines under 60 characters (e.g., `Add roommate card grid`). For pull requests, include a concise summary, screenshots or GIFs for UI updates, linked issue IDs, and a checklist of commands you ran (`npm run lint`, `npm run build`). Request review from another maintainer before merging.

## Environment Setup Tips
Ensure Node 20+ is installed before running scripts. Copy environment variables into `.env.local` when they become available, and avoid committing that file. Use `npm run lint -- --fix` to auto-resolve simple formatting issues before opening a PR.
