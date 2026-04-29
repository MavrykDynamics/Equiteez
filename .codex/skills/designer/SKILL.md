---
name: designer
description: Use this when implementing or updating UI, improving visual consistency, styling components, or creating reusable design-related building blocks.
---

# Purpose

Use this skill when:

- building new UI screens or components
- improving existing design without explicit mockups
- aligning pages/components with an existing design system
- implementing styles from MCP/Figma/design links
- creating reusable UI wrappers or shared visual components

# Design rules

- Follow a clean, polished design style similar to Semantic UI when there is no explicit design provided.
- If the task includes a design link or MCP reference, follow that design as the source of truth.
- Reuse existing global CSS variables, breakpoints, mixins, font sizes, spacing tokens, and other shared styles from the `styles/` folder.
- If needed, extend the shared design tokens in `styles/` instead of hardcoding random values inside components.
- Prefer **CSS Modules** for component styling.
- Keep styling consistent with the existing project patterns and avoid introducing a different visual language.

# Component reuse rules

- Before creating new UI, check whether there are already suitable wrappers, layouts, or components in `lib/` or `templates/`.
- Reuse existing components whenever it makes sense.
- If a reusable component is missing, create one and place it in the proper layer:
  - `atoms/` for simple foundational UI pieces like Button, Input, Badge
  - `molecules/` for small composed components like ButtonWithIcon, SearchInput, CardHeader
  - `organisms/` for larger composed sections like Header, FiltersPanel, AssetTable
  - `templates/` for page-level or screen-level layout structures
- Do not create duplicate components if a small refactor of an existing one is enough.

# Styling rules

- Prefer CSS Modules over inline styles or utility-heavy styling.
- Reuse shared variables and breakpoints from `styles/`.
- Avoid hardcoded colors, spacing, font sizes, border radii, and shadows when shared tokens already exist.
- If new tokens are needed, add them in the shared styles layer in a clean and reusable way.
- Keep responsive behavior aligned with existing breakpoints.
- Maintain visual consistency across spacing, typography, borders, hover states, and layout rhythm.

# Implementation approach

1. Check whether a design link/MCP exists.
2. If yes, follow it closely.
3. If no design is provided, implement a clean and modern UI in the spirit of Semantic UI.
4. Inspect existing `lib/`, `templates/`, and `styles/` before adding new code.
5. Reuse first, extend second, create new last.
6. Place new reusable pieces in the correct architectural layer.
7. Keep code modular, consistent, and easy to reuse later.

# Output expectations

- UI should look consistent with the project, not hacked together.
- Components should be reusable where reasonable.
- Styles should be clean, scoped, and maintainable.
- Shared design tokens should be respected and extended only when necessary.
