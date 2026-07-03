# App Agent Guide

## Sources of Truth

Before enforcing versions, scripts, or conventions, verify them in `package.json`, Remix entry files, and local config files.

Current pinned stack in `package.json`:

- TypeScript `5.1.6`
- React `18.2.0`
- React DOM `18.2.0`
- Remix `2.9.1`
- Vite `5.1.0`
- Node `>=22.0.0`

## Styling Rules

- Prefer CSS Modules over Tailwind utility strings for component and route styling.
- Reuse shared global styles before adding new local styles:
  - `app/styles/index.css` for global CSS variables, fonts, global utility classes, and Tailwind layers
  - `app/styles/redesign.css` for Equiteez 2.0 redesign tokens and `--r-*` CSS variables
  - `app/styles/breakpoints.css` for shared `@custom-media` breakpoints
- When using CSS Modules, reuse existing CSS variables, shared colors, typography, spacing, and breakpoint imports where possible instead of redefining them locally.
- Tailwind is available in the project and `@apply` is already used in some CSS Modules, but default to CSS Modules plus shared globals for new work.
- Match the existing CSS file pattern: `*.module.css`.

## Equiteez 2.0 Redesign System

- Use the `new-r-design` skill for redesign work, new `R*` components, redesign tokens, icons, buttons, typography, or responsive redesign decisions.
- Treat `.codex/skills/new-r-design/SKILL.md` as the single source of truth and living registry for redesign components and patterns.
- Prefix all new redesign components, icons, and related assets with `R`, e.g. `RButton`, `RHeader`, `RSearchIcon`.
- Keep legacy components unchanged unless the task explicitly asks to migrate or replace them.
- Store global redesign tokens in `app/styles/redesign.css` and consume them through CSS variables.
- Prefer `--r-*` CSS variables for redesign-specific tokens. Use semantic aliases such as `--color-primary` only when intentionally shared across old and new UI.
- Current redesign typography uses General Sans for headings and Inter for body text, with Poppins fallbacks.
- Build redesign styles with CSS Modules and shared breakpoints.
- Design mobile-first where practical and use stable dimensions for controls and fixed-format UI.
- Treat only intentionally created redesign components as `R*` registry components. Legacy names that happen to start with `R` are not redesign registry components unless explicitly migrated.

## Redesign Registry Maintenance

- When a new `R*` component is introduced, update `.codex/skills/new-r-design/SKILL.md` in the same PR.
- Record its purpose, location, reusability notes, and related styles or tokens.
- Reuse or extend an existing `R*` component instead of adding a parallel abstraction.

## Project Structure

- `app/root.tsx`, `app/entry.client.tsx`, `app/entry.server.tsx`: Remix app shell and runtime entrypoints.
- `app/routes/`: application routes, route-level loaders/actions, and route-scoped components/styles.
- `app/layouts/`: shared page layout shells such as header, footer, and page wrappers.
- `app/templates/`: reusable feature blocks and larger UI sections shared across routes.
- `app/assets/`: static images and other screen-related assets, organized by purpose/name.
- `app/icons/`, `app/misc/`, `app/mocks/`: shared icons, miscellaneous UI assets, and mocked data.
- `app/contracts/`: blockchain contract methods used by the app and other contract-related logic.
- `app/lib/`: stores, APIs, helpers, atomic-style shared components, formatters, avatar utilities, balance helpers, token metadata utilities, sitemap helpers, and similar shared app logic.
- `app/providers/`: shared React contexts that wrap the app and provide access to app data; similar in purpose to Redux, but built with custom React Context logic.
- `app/hooks/`: shared app-level hooks that are not owned by a single route or provider.
- `app/consts/`, `app/errors/`, `app/utils/`, `app/generated/`: constants, error helpers, app-specific utilities, and generated files.
- `app/styles/`: global stylesheets, shared breakpoints, and other app-wide styling assets.
- `.codex/skills/new-r-design/SKILL.md`: Equiteez 2.0 redesign source of truth and `R*` component registry.
- `app/a11y/`: accessibility-related app setup.
- `functions/`: Cloudflare Pages server functions.
- `public/`: static public assets.
- `scripts/`: build-time and maintenance scripts such as sitemap generation.

## Architecture and Boundaries

- Keep route-specific UI and logic inside the relevant `app/routes/...` folder unless it is reused elsewhere.
- Keep route pages focused on composition and data flow; split sizeable page sections into route-local component folders.
- Put reusable visual building blocks in `app/lib`, `app/layouts`, or `app/templates` based on scope.
- Put redesign atoms in `app/lib/atoms/R*/`, composed redesign components in `app/lib/molecules/R*/` or `app/lib/organisms/R*/`, and shared page-level redesign structures in `app/templates/R*/`.
- Put shared app state and cross-route data access in `app/providers`.
- Reuse existing helpers from `app/lib`, `app/utils`, `app/contracts`, and `app/providers` before adding new modules.
- Keep business logic out of large render components when it can live in a helper, hook, provider, or service module.
- Do not edit generated files manually unless the task explicitly requires it.

## File and Naming Rules

- Use English for identifiers and file names.
- Keep existing naming style in touched areas. This repo mixes `PascalCase.tsx`, `camelCase.ts`, `*.provider.tsx`, `*.schema.ts`, `*.types.ts`, `*.const.ts`, and Remix route naming conventions.
- Do not mass-rename files or folders unless requested.
- New redesign files should use the `R` prefix for component, icon, and related asset names.
- Hook files and hook functions should start with `use`.
- Boolean names should use `is`, `has`, `can`, or `should`.
- Handler names should use `handle`.
- Components and types use `PascalCase`; variables and functions use `camelCase`.

## Coding and Safety Rules

- Change only task-relevant logic.
- Reuse existing helpers and components before creating new ones.
- Keep TypeScript strict and prefer explicit types over `any`.
- Handle errors explicitly; do not fail silently.
- Do not break existing APIs or provider contracts unless requested.
- Avoid incidental refactors while making focused changes.
- Never log secrets or PII.

## Avoid duplicate abstractions

- Do NOT create new components, hooks, or utilities if a similar or identical abstraction already exists.
- Always search in `lib/`, and related folders before adding anything new.
- Prefer reusing and extending existing implementations over duplicating logic.
- If an existing abstraction is close but not perfect:
  - refactor or extend it
  - do NOT create a parallel version with similar behavior
- Avoid slight variations of the same component (e.g. `Button`, `CustomDropdown`, etc.)
- `R*` components may intentionally coexist with legacy components during migration, but do not duplicate an existing `R*` abstraction.
- Keep a single source of truth for shared logic and UI.

Goal: minimize duplication, keep the codebase clean, and avoid fragmented abstractions.

## Project Commands

- `npm run dev`: start Remix Vite dev mode
- `npm run build`: build the app
- `npm run start`: serve the built app with Wrangler Pages dev
- `npm run preview`: build and run a local preview
- `npm run deploy`: build and deploy with Wrangler Pages
- `npm run lint`: run ESLint
- `npm run typecheck`: run TypeScript checks
- `npm run graphql-compile`: generate GraphQL types once
- `npm run graphql-compile-watch`: watch GraphQL codegen
- `npm run generate:sitemap-routes`: regenerate static sitemap routes
- `npm run typegen`: generate Wrangler types
- `npm run cf-typegen`: generate Wrangler types

## AGENTS Maintenance Protocol

When `package.json` scripts, versions, folder conventions, app structure, redesign conventions, or the `R*` component registry process changes, update this file in the same PR.
