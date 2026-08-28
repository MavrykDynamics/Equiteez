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
- Orange: `--r-color-orange-500`
- Red: `--r-color-red-900` through `--r-color-red-100`
- Semantic primary: `--r-color-primary`
- Typography: `--r-font-*`, `--r-font-size-*`, `--r-line-height-*`, `--r-letter-spacing-*`
- Spacing: `--r-space-*`
- Landing/shared layout spacing additions: `--r-space-10`, `--r-space-11`, `--r-space-12`, `--r-space-14`, `--r-space-16`, `--r-space-18`, `--r-space-25`
- Icon sizes: `--r-size-icon-small`, `--r-size-icon-medium`
- Control sizes: `--r-size-control-medium`
- Radius, border, focus, transitions: `--r-radius-xs`, `--r-radius-sm`, `--r-radius-md`, `--r-radius-lg`, `--r-radius-pill`, `--r-border-width-sm`, `--r-focus-ring`, `--r-transition-duration-fast`
- Motion: `--r-motion-ease-premium`, `--r-motion-duration-fast`, `--r-motion-duration-base`, `--r-motion-duration-reveal`
- Shared surfaces: `--r-surface-accent-green-subtle`

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

`RButton` can render native buttons, Remix links, and anchor links through the
`as` prop. Use `as="link"` for internal Remix navigation and `as="a"` for hash
or external links.

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
- `check`
- `close`
- `copy`
- `heart`
- `grid`
- `image`
- `list`
- `loading`
- `lock`
- `lock-open`
- `radio`
- `refund`
- `search`
- `sort`
- `star`
- `trash`
- `trending-down`
- `trending-up`
- `upload`
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
- Route-level redesign pages should stay focused on composition and data flow. For new or restructured pages, prefer a route-level `RPageName/` page folder alongside a `components/` folder for page-specific sections, large JSX blocks, and page-local UI logic.
- Do not keep all multi-section page UI inside a single `R*Page.tsx`; split sizeable sections into route-local component folders before promoting them to shared templates or shared `R*` components.
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
- Reusability notes: Use for all redesign buttons before creating specialized button variants. Supports variants, tones, sizes, left/right icons, disabled, loading states, internal Remix links, and anchor links.
- Related tokens: `--r-font-body`, `--r-font-size-body-*`, `--r-line-height-body-*`, `--r-radius-pill`, `--r-border-width-sm`, `--r-focus-ring`, `--r-surface-*button*`, `--r-text-*`, `--r-space-1`, `--r-transition-duration-fast`

## RTypography

- Purpose: Shared redesign typography atoms for Figma-aligned body text and headings.
- Location: `app/lib/atoms/RTypography/RText.tsx` and `app/lib/atoms/RTypography/RHeading.tsx`
- Reusability notes: Use `RText` with `body-l` through `body-xs`, and `RHeading` with `h1` through `h7`. Both support `400` and `500` weights plus the typed `--r-color-*` palette through their `color` prop.
- Related tokens: `--r-font-heading`, `--r-font-body`, `--r-font-size-heading-*`, `--r-line-height-heading-*`, `--r-font-size-body-*`, `--r-line-height-body-*`, `--r-font-weight-*`, `--r-color-*`

## RIcon

- Purpose: Typed inline SVG icon atom for the redesign icon system.
- Location: `app/lib/atoms/RIcon/RIcon.tsx`
- Styles: `app/lib/atoms/RIcon/RIcon.module.css`
- Reusability notes: Use for common redesign icons and button icons. Extend the typed `RIconName` registry when adding shared icons. The `sort` icon supports `sortDirection="ascending" | "descending"` to make only the active arrow black.
- Related tokens: `--r-size-icon-small`, `--r-size-icon-medium`

## RInput

- Purpose: Redesign text-input atom with an optional leading `RIcon`.
- Location: `app/lib/atoms/RInput/RInput.tsx`
- Styles: `app/lib/atoms/RInput/RInput.module.css`
- Reusability notes: Use native input props and pass an `RIconName` via `icon` for a leading decorative icon. Use `inputClassName` only for input-specific layout overrides.
- Related tokens: `RIcon`, `--r-font-body`, `--r-font-size-body-sm`, `--r-line-height-body-sm`, `--r-space-2`, `--r-space-3`, `--r-radius-sm`, `--r-border-width-sm`, `--r-focus-ring`, `--r-color-*`

## RViewSwitcher

- Purpose: Compact, controlled image/grid/list view selector.
- Location: `app/lib/atoms/RViewSwitcher/RViewSwitcher.tsx`
- Styles: `app/lib/atoms/RViewSwitcher/RViewSwitcher.module.css`
- Reusability notes: Use `value` and `onChange` to switch between `image`, `grid`, and `list` layouts. Renders the matching shared `RIcon` glyphs.
- Related tokens: `RIcon`, `--r-space-1`, `--r-radius-xs`, `--r-radius-sm`, `--r-focus-ring`, `--r-color-neutral-*`

## RCard

- Purpose: Shared redesign card surface atom with light, dark, and green tones plus reusable default and mock-image shapes.
- Location: `app/lib/atoms/RCard/RCard.tsx`
- Styles: `app/lib/atoms/RCard/RCard.module.css`
- Reusability notes: Use for repeated redesign card surfaces before creating route-specific card shells. Use `shape="mock"` with `shadow="soft"` or `shadow="strong"` for Figma-exported mock images whose bitmap assets should not include shadows.
- Related tokens: `--r-radius-md`, `--r-border-width-sm`, `--r-color-neutral-*`, `--r-color-accent-green-*`

## RImageAssetsView

- Purpose: Route-local Figma image-card view for the Explore Assets `image` mode, with local 12-item pagination.
- Location: `app/routes/_index/components/RImageAssetsView/`
- Reusability notes: Keep this view within Explore Assets until another route requires the same image-card layout. It reuses `AssetBadge`, `AssetIdentity`, `AssetSaleProgress`, `AssetPriceChart`, and the `ASSET_IMAGE_URLS_BY_ADDRESS` mock mapping.
- Related tokens: `RIcon`, `RText`, `RPagination`, `--r-color-neutral-*`, `--r-color-accent-green-*`, `--r-space-*`, `--r-radius-md`

## RChip

- Purpose: Small redesign pill atom for compact labels and metric chips.
- Location: `app/lib/atoms/RChip/RChip.tsx`
- Styles: `app/lib/atoms/RChip/RChip.module.css`
- Reusability notes: Use for non-interactive pill labels in redesign sections.
- Related tokens: `--r-font-body`, `--r-font-size-body-*`, `--r-line-height-body-*`, `--r-radius-pill`, `--r-color-green-*`, `--r-color-neutral-*`

## RTab

- Purpose: Single redesign tab atom with selected, hover, focus, and disabled states.
- Location: `app/lib/atoms/RTab/RTab.tsx`
- Styles: `app/lib/atoms/RTab/RTab.module.css`
- Reusability notes: Use inside redesign tablist controls such as `RTabSwitcher`. Supports the Figma-selected state and an optional numeric count; labels and counts use `RText`.
- Related tokens: `RText`, `--r-space-*`, `--r-radius-pill`, `--r-border-width-sm`, `--r-focus-ring`, `--r-color-neutral-*`

## RTabSwitcher

- Purpose: Redesign tablist organism that groups `RTab` items for controlled tab switching.
- Location: `app/lib/organisms/RTabSwitcher/RTabSwitcher.tsx`
- Styles: `app/lib/organisms/RTabSwitcher/RTabSwitcher.module.css`
- Reusability notes: Use for compact redesign tab switchers before creating page-specific switcher markup. Each item can expose an optional count and matches the separated pill-tab Figma pattern.
- Related tokens: `RTab`, `RText`, `--r-space-2`, `--r-color-neutral-*`

## RCustomDropdown

- Purpose: Compositional redesign dropdown with context-managed state, trigger, menu, and selectable options.
- Location: `app/lib/organisms/RCustomDropdown/RCustomDropdown.tsx`
- Styles: `app/lib/organisms/RCustomDropdown/RCustomDropdown.module.css`
- Reusability notes: Compose `RCustomDropdown`, `RDropdownFaceContent`, `RDropdownBodyContent`, and `RDropdownBodyContentItem`. The menu closes on selection, outside interaction, or Escape.
- Related tokens: `RText`, `RIcon`, `--r-size-control-medium`, `--r-space-*`, `--r-radius-sm`, `--r-border-width-sm`, `--r-focus-ring`, `--r-color-neutral-*`

## Portfolio activity tab placeholders

- Purpose: Route-local placeholders for the Open Orders, Transaction History, and Deposits activity tables while their data and table UI are pending.
- Location: `app/routes/portfolio.activity/components/ROpenOrdersTab.tsx`, `RTransactionHistoryTab.tsx`, and `RDepositsTab.tsx`
- Reusability notes: Keep these components route-local; replace their label-only content with the corresponding table implementation when activity data is connected.
- Related tokens: `RText`, `--r-font-body`, `--r-font-size-body-sm`, `--r-line-height-body-sm`

## ROrderStatusBadge

- Purpose: Route-local redesign badge that maps order-history statuses to the Figma `FILLED`, `OPEN`, and canceled visual states.
- Location: `app/routes/trade.$address/components/AssetTabs/OrderHistoryTab/ROrderStatusBadge.tsx`
- Reusability notes: Use for order-history status rendering. `fulfilled` is displayed as `FILLED`, `pending` as `OPEN`, and all other API values keep their original text with the canceled visual treatment.
- Related tokens: `--r-color-green-*`, `--r-color-yellow-*`, `--r-color-neutral-*`, `--r-font-body`, `--r-font-size-body-s`, `--r-line-height-body-s`, `--r-space-3`, `--r-radius-pill`

## RMarketDepthChart

- Purpose: Route-local cumulative bid/ask liquidity visualization for the Trade page depth chart.
- Location: `app/routes/trade.$address/components/ChartBlock/RMarketDepthChart.tsx`
- Reusability notes: Use `useOrderbookDepth` for live aggregated orderbook levels. It displays cumulative bids in green and asks in red, with the mid-market price, scale controls, and hover details. Keep it route-local until the same depth chart is required outside Trade.
- Related tokens: `--r-color-green-*`, `--r-color-red-*`, `--r-color-neutral-*`, `--r-font-body`, `--r-font-size-body-*`, `--r-space-*`, `--r-focus-ring`

## RTransferTypeIcon

- Purpose: Route-local deposit and withdrawal direction icon for portfolio activity transfer rows and details.
- Location: `app/routes/portfolio.activity/components/DepositsTab/RTransferTypeIcon.tsx`
- Reusability notes: Use with transfer history items; it renders the Figma-approved 16px arrow through `currentColor`, so the parent supplies the green or red semantic tone.
- Related tokens: `--r-size-icon-small`, `--r-color-green-500`, `--r-color-red-500`

## RDepositFundsModal

- Purpose: Route-local redesign modal for mock USDT deposits through the Ethereum bridge or directly to a Mavryk address.
- Location: `app/routes/discover/components/DepositFunds/RDepositFundsModal.tsx`
- Reusability notes: Controlled with `isOpen` and `onClose`; both tabs use local mock values until deposit APIs and wallet flows are connected.
- Related tokens: `CustomPopup`, `RButton`, `RIcon`, `RHeading`, `RText`, `--r-color-*`, `--r-space-*`, `--r-radius-*`

## RFeatureCard

- Purpose: Shared redesign icon-card organism for feature, framework, and advantage cards.
- Location: `app/lib/organisms/RFeatureCard/RFeatureCard.tsx`
- Styles: `app/lib/organisms/RFeatureCard/RFeatureCard.module.css`
- Reusability notes: Use for repeated white cards with a Figma-exported icon, heading, and description. Supports medium and large padding variants, legacy image-source icons, inline SVG icons, and `iconColor` for `currentColor`-driven icon rendering.
- Related tokens: `RCard`, `--r-color-neutral-*`, `--r-color-accent-green-*`, `--r-font-heading`, `--r-font-body`, `--r-space-*`

## RLogo

- Purpose: Redesign Equiteez by Mavryk logo atom with white and black tones.
- Location: `app/lib/atoms/RLogo/RLogo.tsx`
- Styles: `app/lib/atoms/RLogo/RLogo.module.css`
- Reusability notes: Use in redesign headers, footers, and marketing layouts before creating page-specific logo markup. Uses Figma-exported SVG mark/wordmark assets and tone-driven black/white rendering.
- Related tokens: `--r-font-heading`, `--r-color-neutral-*`, `--r-transition-duration-fast`, `app/assets/redesign/logo/*`

## RSectionHeader

- Purpose: Shared redesign section heading block with eyebrow, multi-line heading, optional description, alignment, and tone.
- Location: `app/lib/molecules/RSectionHeader/RSectionHeader.tsx`
- Styles: `app/lib/molecules/RSectionHeader/RSectionHeader.module.css`
- Reusability notes: Use for marketing and informational redesign sections that follow the Equiteez 2.0 heading rhythm.
- Related tokens: `--r-font-heading`, `--r-font-body`, `--r-font-size-heading-*`, `--r-line-height-heading-*`, `--r-font-size-body-*`, `--r-color-neutral-*`

## RMetricCard

- Purpose: Small redesign metric card with label and value text for compact stats.
- Location: `app/lib/molecules/RMetricCard/RMetricCard.tsx`
- Styles: `app/lib/molecules/RMetricCard/RMetricCard.module.css`
- Reusability notes: Use for compact two-line metric summaries before recreating route-specific stat cards.
- Related tokens: `--r-font-body`, `--r-font-size-body-*`, `--r-line-height-body-*`, `--r-color-neutral-*`, `--r-space-*`

## RPriceChange

- Purpose: Shared redesign price-change molecule for signed fiat delta and percentage, with an optional trailing period label such as `24h`.
- Location: `app/lib/molecules/RPriceChange/RPriceChange.tsx`
- Styles: `app/lib/molecules/RPriceChange/RPriceChange.module.css`
- Reusability notes: Use for asset price-change readouts in cards, tables, and compact market surfaces. Supports empty-state fallback, positive/negative icon coloring, and optional period label rendering through `showPeriodLabel`.
- Related tokens: `RIcon`, `RText`, `Money`, `--r-space-1`, `--r-color-green-500`, `--r-color-red-500`, `--r-color-neutral-600`

## RPagination

- Purpose: Controlled API pagination molecule with page-number navigation, ellipses, and loading-aware previous/next controls.
- Location: `app/lib/molecules/RPagination/RPagination.tsx`
- Reusability notes: Pass one-based `currentPage`, API `totalPages`, and `onPageChange`; set `isLoading` while an API page request is in flight.
- Related tokens: `RIcon`, `RText`, `--r-space-1`, `--r-color-neutral-*`, `--r-radius-sm`, `--r-border-width-sm`, `--r-focus-ring`

## RSortableTableHeader

- Purpose: Shared sortable table-header molecule with the two-direction `RIcon` sort indicator.
- Location: `app/lib/molecules/RSortableTableHeader/RSortableTableHeader.tsx`
- Reusability notes: Use for sortable column headers. Pass a column `label`, the active `direction`, and `onSort`; the component owns the semantic `<th>`, button and `aria-sort` state.
- Related tokens: `RIcon`, `--r-color-neutral-*`, `--r-focus-ring`, `--r-size-icon-small`

## RHeader

- Purpose: Shared fixed redesign header with landing and solutions variants, scrolled state, desktop navigation, and mobile-ready menu structure.
- Location: `app/layouts/RHeader/RHeader.tsx`
- Styles: `app/layouts/RHeader/RHeader.module.css`
- Reusability notes: Use `variant="landing"` for overlay-friendly home hero navigation and `variant="solutions"` for white page headers with section links. The landing variant switches to a white scrolled/menu surface with the shared white-background divider. Legacy `transparent` and `light` variants remain compatible aliases.
- Related tokens: `RLogo`, `RButton`, `RIcon`, `--r-space-*`, `--r-color-neutral-*`, `--r-border-width-sm`, `--r-radius-pill`

## RFooter

- Purpose: Shared redesign footer with logo, grouped links, legal/social links, and Mavryk attribution.
- Location: `app/layouts/RFooter/RFooter.tsx`
- Styles: `app/layouts/RFooter/RFooter.module.css`
- Reusability notes: Use for redesign pages that need the Equiteez 2.0 footer. Link groups can be overridden through props.
- Related tokens: `RLogo`, `--r-space-*`, `--r-color-neutral-*`, `--r-border-width-sm`

## RMarketingCtaSection

- Purpose: Shared redesign CTA section for marketing pages with centered heading, description, and one or two actions.
- Location: `app/templates/RMarketingCtaSection/RMarketingCtaSection.tsx`
- Styles: `app/templates/RMarketingCtaSection/RMarketingCtaSection.module.css`
- Reusability notes: Use for shared page-level CTA blocks before recreating route-local CTA markup.
- Related tokens: `RSectionHeader`, `RButton`, `RIcon`, `Reveal`, `--r-space-*`

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
