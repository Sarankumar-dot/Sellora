# Sellora Design System

This document is the source of truth for Sellora’s frontend visual language. Every new page, component, and state must follow it. The experience is premium, calm, monospaced, and highly usable: Vercel/Linear/Raycast restraint paired with deliberate editorial hierarchy.

## Principles

1. Make the interface quiet. Use whitespace, hierarchy, and clear language before adding decoration.
2. Use one clear primary action per view whenever possible.
3. Prefer progressive disclosure to dense controls and competing visual emphasis.
4. Every visual treatment must communicate structure, state, or an available action. Decorative imagery and icons are not permitted.
5. Build mobile-first, then add space—not clutter—at larger viewports.

## Branding

The brand is the word **Sellora**, set in JetBrains Mono. It has no icon mark in authentication flows. The navbar and other product surfaces may use the wordmark alone.

- Use the shared `Logo` component for a linked brand wordmark.
- Do not create alternate text treatments, monograms, decorative SVGs, gradients, or logo icons.
- Keep the wordmark in `foreground` and allow enough surrounding whitespace for it to breathe.

## Typography

JetBrains Mono is Sellora’s **only** typeface. It is loaded globally from Google Fonts and configured as `font-sans`, `font-serif`, and `font-mono`, so all existing and future content inherits the same family without per-component font overrides.

| Role | Font stack | Use |
|---|---|---|
| Global | `JetBrains Mono`, system monospace fallbacks | Brand, headings, body, navigation, forms, buttons, tables, prices, order IDs, dashboards, cards, and footer. |

Never introduce an additional font family. Do not use `font-serif` or `font-sans` to create visual pairing; both intentionally resolve to JetBrains Mono.

### Type scale

| Token / context | Mobile | Desktop | Weight / tracking |
|---|---:|---:|---|
| Hero | 48px | 56–64px | 800, tight but readable tracking |
| Page title | 40px | 40–48px | 700 |
| Section heading | 30px | 30–36px | 700 |
| Card heading | 22px | 24px | 700 |
| Body | 16px | 16px | 400, 1.6 line-height |
| UI label / button | 14px | 14px | 500–600 |
| Metadata / helper | 14px | 14px | 400 |
| Caption | 12px | 12px | 400 |

Use sentence case. Avoid all-caps except compact, nonessential metadata. Use 100–300 only for rare decorative treatment, 400 for body, 500 for labels, 600 for buttons, 700 for headings, and 800 for large titles. Increase whitespace and line-height rather than increasing text density. Do not use icons in headings or authentication pages.

## Color

Use semantic tokens instead of literal colors in new work. They are available through Tailwind utilities such as `bg-background`, `text-foreground`, `border-border`, and `text-muted-foreground`.

| Token | Value | Intended use |
|---|---|---|
| `background` | `#fafafa` | Application canvas. |
| `surface` / `card` | `#ffffff` | Elevated, readable content areas. |
| `primary` | `#0f172a` | Primary actions and strong text. |
| `primary-hover` | `#1e293b` | Primary action hover state. |
| `secondary` | `#f1f5f9` | Low-emphasis interactive backgrounds. |
| `border` | `#e2e8f0` | Boundaries and control outlines. |
| `foreground` | `#0f172a` | Main text. |
| `muted` | `#f8fafc` | Subtle filled areas. |
| `muted-foreground` | `#64748b` | Supporting text. |
| `success` | `#15803d` | Confirmed/success state. |
| `warning` | `#b45309` | Caution state. |
| `error` | `#dc2626` | Error/destructive state. |

Neutral tones should compose most of the page. Color should carry meaning, never decoration. Maintain WCAG AA contrast at a minimum.

## Spacing

Use the 8px rhythm. Prefer only these values for new layouts:

| Tailwind utility | Pixels | Typical use |
|---|---:|---|
| `1` | 4px | Inline icon/control detail. |
| `2` | 8px | Label-to-control gap. |
| `4` | 16px | Related controls. |
| `6` | 24px | Form groups / compact section gaps. |
| `8` | 32px | Card padding / section gap. |
| `10` | 40px | Major card separation. |
| `12` | 48px | Page section spacing. |
| `16` | 64px | Large page separation. |
| `20` | 80px | Hero-level separation. |

Avoid arbitrary spacing values. Use `gap-*`, `space-y-*`, and responsive padding instead of manual margins where practical.

## Radius and borders

| Token | Value | Use |
|---|---:|---|
| `rounded-sm` | 6px | Tiny internal elements only. |
| `rounded-md` | 8px | Tags and compact menus. |
| `rounded-lg` | 12px | Small panels. |
| `rounded-xl` | 16px | Buttons and inputs. |
| `rounded-2xl` | 20px | Standard cards. |
| `rounded-3xl` | 24px | Prominent cards. |
| `rounded-4xl` | 32px | Authentication cards only. |

Use `border-border` at one physical pixel. Borders are subtle structure, not decoration.

## Elevation

Only `shadow-sm`, `shadow`, and `shadow-md` are allowed. They are globally tuned for restrained elevation.

- `shadow-sm`: standard card/control elevation.
- `shadow`: floating controls, popovers, and important cards.
- `shadow-md`: dialogs only.

Never use heavy, colored, arbitrary, or multiple shadows.

## Icon system

`lucide-react` is Sellora’s only icon library. Do not add, mix, or hand-draw icon sets.

- Import named icons directly: `import { ShoppingCart } from 'lucide-react'`.
- Use a 16px icon for compact controls and 20px for standard navigation/actions.
- Use icons only when they make an action faster to recognize: search, cart, user, notifications, seller, package, shopping bag, plus, edit, trash, analytics, trending up, bar chart, orders, package check, truck, admin, shield, users, settings, categories, grid, products, or box.
- Pair an icon with accessible text when the meaning is not universally obvious. Icon-only controls require an accessible name (`aria-label`) and a tooltip.
- Icons must not be used in headings, login/auth screens, as decorative artwork, or as a substitute for clear copy.

## Buttons

All buttons use `rounded-xl`, a 44px minimum height, 14px JetBrains Mono at weight 600, and a visible keyboard focus ring. Use the shared `Button` component; extend it rather than creating ad hoc button styles. Do not increase button font size to create emphasis—use weight and hierarchy instead.

| Variant | Treatment | Intended use |
|---|---|---|
| Primary | `bg-primary text-white`, hover `primary-hover` | One dominant action per context. |
| Secondary | `bg-secondary text-foreground` | Secondary positive actions. |
| Outline | Transparent/surface with `border-border` | Alternative or low-emphasis actions. |
| Ghost | Transparent, subtle muted hover | Toolbar and inline actions. |
| Destructive | `bg-error text-white` | Irreversible actions after confirmation. |
| Loading | Same geometry; spinner + clear present-tense label | Prevent duplicate mutation. |
| Disabled | Reduced opacity, no pointer events, preserved readable label | Unavailable action. |

Transitions are limited to color, border, shadow, and opacity over 150–250ms. Do not animate layout.

## Inputs and forms

Use the shared `Input` component and React Hook Form. Inputs are `rounded-xl`, full width, 44px minimum height, and use JetBrains Mono. Maintain generous horizontal padding (`px-4` minimum) and comfortable vertical breathing room for the wider monospaced glyphs.

| State | Requirement |
|---|---|
| Default | White/surface background, `border-border`, descriptive label. |
| Focused | Strong primary border and soft focus ring; never remove focus visibility. |
| Disabled | Muted surface, disabled cursor, readable text. |
| Error | `error` border/ring, an adjacent text explanation, and `aria-invalid`. |
| Success | Use success confirmation only when it is meaningful; do not over-confirm ordinary input. |
| Helper text | Concise, muted, directly below the field. |
| Password | `type="password"`, proper `autocomplete`, and an optional labelled visibility toggle using Lucide only when needed. |

Use labels, not placeholder-only fields. Display validation near the field; use an alert/toast only for form-level or server-level failures. Disable the submit button during mutations.

## Cards

Cards separate content, not every element.

| Property | Standard card | Authentication card |
|---|---|---|
| Background | `bg-card` | `bg-card` |
| Border | `border border-border` | `border border-border` |
| Radius | `rounded-2xl` or `rounded-3xl` | `rounded-4xl` |
| Shadow | `shadow-sm` | `shadow` |
| Padding | `p-6 sm:p-8` | `p-6 sm:p-8` |

Use one clear card surface per contained workflow. Avoid nested card stacks.

## Toast notifications

Use `react-hot-toast` only for asynchronous outcome feedback that does not need persistent space in the layout.

- Success: concise confirmation of completed user action.
- Error: safe, actionable message; never expose raw API/server errors.
- Avoid toasts for field-validation errors, passive state changes, or routine navigation.
- Do not stack repeated identical toasts.

## Accessibility

- Meet WCAG 2.1 AA contrast and retain visible keyboard focus for every interactive element.
- Use semantic landmarks, native controls, labels, and correct heading order.
- Add `aria-live`/`role="alert"` to dynamic status and error messages where appropriate.
- Every icon-only action requires an accessible label and tooltip.
- Touch targets are at least 44 × 44px.
- Respect `prefers-reduced-motion`; do not make motion necessary to understand state.

## Responsive rules

Design mobile-first. Test all new screens at these widths before review:

| Width | Target |
|---:|---|
| 320px | Small mobile; no horizontal scroll, safe 16px page gutters. |
| 375px | Standard mobile. |
| 390px | Modern compact mobile. |
| 414px | Large mobile. |
| 768px | Tablet; introduce larger page padding and balanced columns only where needed. |
| 1024px | Small desktop; navigation and dashboards may expand. |
| 1280px | Standard desktop content width. |
| 1440px | Wide desktop; preserve readable max-widths and whitespace. |

Use responsive gutters: `px-4` on mobile, `sm:px-6` at tablet, `lg:px-8` on desktop. Forms remain full width within a readable maximum. Authentication cards use `w-full max-w-md`, never touch viewport edges, and remain vertically centered with `min-h-screen flex items-center justify-center`.

## Motion

- Use the shared primitives in `client/src/animations/`; never add one-off page animation code.
- `PageTransition` provides route transitions: fade plus an 8px horizontal slide over 260ms.
- `FadeIn`, `StaggerContainer`, and `StaggerItem` provide understated section/list entrance animation.
- `AnimatedButton` provides opacity/elevation hover plus a small tap response; `AnimatedCard` lifts 2px on hover.
- `AnimatedModal`, `AnimatedDropdown`, and `AnimatedDrawer` provide the standard overlay, menu, and panel motion.
- `Skeleton` is the standard loading placeholder. It uses opacity only.
- Duration: 160ms (fast), 220ms (standard), or 260ms (route). Easing: standard ease-in-out only.
- Animate only opacity and transforms. Never animate width, height, top, left, or layout-sensitive properties.
- Never use bounce, parallax, exaggerated scale, decorative motion, or looping animation other than an accessible loading indicator.
- `MotionConfig reducedMotion="user"` and every primitive respect `prefers-reduced-motion`; motion is disabled when requested.

## Implementation checklist

Before merging a future UI change, verify:

1. JetBrains Mono is the only font used for all content, controls, and brand text.
2. Semantic tokens, the 8px spacing scale, approved radii, and approved shadows are used.
3. Lucide is the only icon source and every icon improves usability.
4. Forms use labels, visible focus, local errors, safe server feedback, and loading/disabled states.
5. The page passes the specified viewport widths without horizontal overflow.
6. The UI has one obvious primary action and no decorative visual noise.
