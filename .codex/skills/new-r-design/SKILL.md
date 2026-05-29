---
name: new-r-design
description: Use this as the single source of truth for the Equiteez 2.0 redesign system. Use when working on redesign tokens, color palette, typography, R-prefixed components, buttons, icons, CSS variable usage, responsive/mobile redesign behavior, redesign folder structure, or when adding/updating any R component registry entry.
---

# Purpose

Use this skill for all Equiteez 2.0 redesign work. Treat this file as the living redesign registry and update it whenever a new `R*` component, icon, asset, or redesign architecture decision is introduced.

# Source Files

- Global redesign tokens: `app/styles/redesign.css`
- Global stylesheet import: `app/styles/index.css`
- Shared breakpoints: `app/styles/breakpoints.css`
- Existing redesign atoms: `app/lib/atoms/RButton/`, `app/lib/atoms/RIcon/`

# Core Rules

- Prefix all new redesign components, icons, and related assets with `R`.
- Treat only intentionally created redesign components as `R*` registry components. Legacy names that happen to start with `R`, such as `RoundedCard`, are not part of this registry unless explicitly migrated.
- Prefer CSS Modules for redesign component and route styling.
- Use `*.module.css` for component styles.
- Use CSS variables from `app/styles/redesign.css` instead of hardcoded values.
- Prefer `--r-*` variables for redesign-only styling.
- Keep legacy components stable unless a task explicitly asks for migration.
- Reuse existing `R*` components before creating new ones.
- Keep business logic out of large render components.
- Keep new components typed and strict. Do not use `any`.

# Design Tokens

Store redesign tokens in `app/styles/redesign.css`.

Use these token groups:

- Neutral: `--r-color-neutral-black`, `--r-color-neutral-900` through `--r-color-neutral-50`, `--r-color-neutral-white`
- Accent green: `--r-color-accent-green-950` through `--r-color-accent-green-50`
- Blue: `--r-color-blue-900` through `--r-color-blue-100`
- Green: `--r-color-green-900` through `--r-color-green-100`
- Yellow: `--r-color-yellow-900` through `--r-color-yellow-100`
- Red: `--r-color-red-900` through `--r-color-red-100`
- Semantic primary: `--r-color-primary`
- Typography: `--r-font-*`, `--r-font-size-*`, `--r-line-height-*`, `--r-letter-spacing-*`
- Spacing: `--r-space-*`
- Icon sizes: `--r-size-icon-small`, `--r-size-icon-medium`
- Radius, border, focus, transitions: `--r-radius-pill`, `--r-border-width-sm`, `--r-focus-ring`, `--r-transition-duration-fast`

Add new tokens only when they are shared by multiple redesign components or map directly to the Figma system.

# Typography

- Headings use `var(--r-font-heading)`.
- Body text uses `var(--r-font-body)`.
- Heading weight is `var(--r-font-weight-medium)`.
- Body regular and medium weights are `var(--r-font-weight-regular)` and `var(--r-font-weight-medium)`.
- Use heading sizes `h1` through `h7` from `--r-font-size-heading-*` and `--r-line-height-heading-*`.
- Use body sizes `l`, `m`, `sm`, `s`, and `xs` from `--r-font-size-body-*` and `--r-line-height-body-*`.
- Keep letter spacing at `var(--r-letter-spacing-heading)` or `var(--r-letter-spacing-body)`.
- Do not scale typography with viewport width.

# Buttons

Use `RButton` for redesign buttons.

Supported props:

- `variant`: `primary` or `secondary`
- `tone`: `white` or `black`
- `size`: `large`, `medium`, or `small`
- `iconLeft` and `iconRight`
- `isLoading`
- native button props except for the narrowed async-aware `onClick`

Button dimensions:

- `large`: 52px min-height, 14px 32px padding, body M typography
- `medium`: 45px min-height, 12px 24px padding, body S-M typography
- `small`: 38px min-height, 10px 16px padding, body S typography

Button states must use tokens for default, hover, disabled, focus, and loading.

# Icons

Use `RIcon` for redesign icons unless a task explicitly requires a standalone prefixed asset like `RSearchIcon`.

Supported sizes:

- `small`: `--r-size-icon-small`
- `medium`: `--r-size-icon-medium`

Current icon names:

- `arrow-short-down`
- `arrow-short-up`
- `arrow-short-left`
- `arrow-short-right`
- `arrow-long-down`
- `arrow-long-up`
- `arrow-long-left`
- `arrow-long-right`
- `arrow-long-up-right`
- `arrow-round`
- `burger-menu`
- `loading`
- `lock`
- `lock-open`
- `radio`
- `trending-down`
- `trending-up`
- `web`

Icon rules:

- Render icons with `currentColor`.
- Keep icon sizing stable with CSS variables.
- Add accessible `title` only when an icon conveys standalone meaning.
- Mark decorative icons as hidden from assistive tech.
- Add new common icons to `RIcon` before creating separate SVG wrappers.

# Folder Structure

Use the existing app structure:

- Atoms: `app/lib/atoms/RComponentName/`
- Molecules: `app/lib/molecules/RComponentName/`
- Organisms: `app/lib/organisms/RComponentName/`
- Shared templates: `app/templates/RComponentName/`
- Route-specific redesign UI: keep it in the owning route under `app/routes/...`
- Global tokens: `app/styles/redesign.css`
- Shared breakpoints: `app/styles/breakpoints.css`

Each reusable `R*` component folder should normally contain:

- `RComponentName.tsx`
- `RComponentName.module.css`
- `index.tsx`

# CSS Usage

- Import CSS Modules as `styles`.
- Use `clsx` for conditional class names.
- Consume tokens with `var(--r-token-name)`.
- Import `app/styles/breakpoints.css` in a CSS Module when responsive breakpoints are needed.
- Avoid inline styles unless values are dynamic and cannot be expressed safely in CSS.
- Avoid Tailwind utility strings for redesign components unless the styling is trivial and isolated.

# Responsive Rules

- Design mobile-first where practical.
- Verify desktop and mobile layouts for redesigned pages and shared components.
- Use stable dimensions for buttons, icon buttons, controls, counters, cards, and fixed-format UI.
- Do not let hover states, loading states, labels, or icons change component dimensions.
- Ensure text does not overflow or overlap at phone, tablet, and desktop breakpoints.
- Use shared custom media from `app/styles/breakpoints.css`.

# Architecture Decisions

- The redesign system can intentionally coexist with legacy components through `R*` names.
- Do not break existing public component APIs during redesign foundation work.
- Migrate pages incrementally by introducing `R*` components and replacing legacy UI where requested.
- Keep route-specific redesign logic in the route folder until it is reused.
- Promote reused route UI into `app/lib`, `app/layouts`, or `app/templates` based on scope.
- Keep `app/styles/redesign.css` as the global token source. Do not duplicate token values in component CSS.

# Component Registry

## RButton

- Purpose: Redesign button atom based on the Equiteez 2.0 button system.
- Location: `app/lib/atoms/RButton/RButton.tsx`
- Styles: `app/lib/atoms/RButton/RButton.module.css`
- Reusability notes: Use for all redesign buttons before creating specialized button variants. Supports variants, tones, sizes, left/right icons, disabled, and loading states.
- Related tokens: `--r-font-body`, `--r-font-size-body-*`, `--r-line-height-body-*`, `--r-radius-pill`, `--r-border-width-sm`, `--r-focus-ring`, `--r-surface-*button*`, `--r-text-*`, `--r-space-1`, `--r-transition-duration-fast`

## RIcon

- Purpose: Typed inline SVG icon atom for the redesign icon system.
- Location: `app/lib/atoms/RIcon/RIcon.tsx`
- Styles: `app/lib/atoms/RIcon/RIcon.module.css`
- Reusability notes: Use for common redesign icons and button icons. Extend the typed `RIconName` registry when adding shared icons.
- Related tokens: `--r-size-icon-small`, `--r-size-icon-medium`

# Registry Update Protocol

When adding a new `R*` component:

1. Check this registry for an existing reusable component.
2. Reuse or extend an existing `R*` component when practical.
3. Add the new component in the correct folder layer.
4. Use CSS Modules and `app/styles/redesign.css` tokens.
5. Add a registry entry in this file with:
   - Component name
   - Purpose
   - Location
   - Reusability notes
   - Related styles or tokens, if applicable
6. Update `AGENTS.md` if the change affects redesign conventions, folder structure, or registry maintenance rules.

# Validation

- Run targeted lint for new or changed `R*` TypeScript files when possible.
- Run `npm run build` for changes that affect imports, styles, or app rendering.
- Run `npm run typecheck` when practical and document unrelated existing failures if they block a clean result.
