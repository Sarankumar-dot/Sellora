---
name: Sellora Baseline
colors:
  surface: '#fbf9f9'
  surface-dim: '#dbdad9'
  surface-bright: '#fbf9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3f3'
  surface-container: '#efeded'
  surface-container-high: '#e9e8e7'
  surface-container-highest: '#e3e2e2'
  on-surface: '#1b1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#303031'
  inverse-on-surface: '#f2f0f0'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#904c31'
  on-secondary: '#ffffff'
  secondary-container: '#fea685'
  on-secondary-container: '#783920'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1c1b'
  on-tertiary-container: '#838482'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#ffdbce'
  secondary-fixed-dim: '#ffb59a'
  on-secondary-fixed: '#380d00'
  on-secondary-fixed-variant: '#72351c'
  tertiary-fixed: '#e3e2e0'
  tertiary-fixed-dim: '#c7c6c5'
  on-tertiary-fixed: '#1a1c1b'
  on-tertiary-fixed-variant: '#464746'
  background: '#fbf9f9'
  on-background: '#1b1c1c'
  surface-variant: '#e3e2e2'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter-desktop: 32px
  gutter-mobile: 16px
  margin-desktop: 64px
  margin-mobile: 20px
---

## Brand & Style

The design system is anchored in **Elevated Minimalism**, drawing inspiration from high-end Direct-to-Consumer (D2C) aesthetics and editorial luxury. The brand personality is sophisticated, calm, and curated, prioritizing white space and intentionality over visual noise. It aims to evoke a sense of permanence and quality, similar to a physical gallery or a luxury boutique.

The style utilizes a "Quiet Luxury" approach:
- **Minimalism:** Use of expansive margins and negative space to frame products as art pieces.
- **Tactile Refinement:** Subtle use of depth and soft shadows to suggest a physical presence without breaking the clean, flat aesthetic.
- **Editorial Influence:** High-contrast typography pairings that mimic premium print journals.

## Colors

The palette is built on a foundation of warm neutrals to provide a softer, more premium feel than pure white. 

- **Base/Background (#F9F8F6):** A warm off-white that reduces eye strain and provides a sophisticated backdrop for product photography.
- **Primary/Text (#1A1A1A):** A deep charcoal used for maximum legibility and high-contrast branding.
- **Accent (#A45C40):** A sophisticated terracotta used sparingly for primary call-to-actions, notifications, or highlighting key brand moments.
- **Neutral (#757575):** Used for secondary text, borders, and disabled states to maintain a low-friction hierarchy.

## Typography

This design system uses a classic serif/sans-serif pairing to establish an editorial hierarchy.

- **Headlines:** Use *Playfair Display*. It should be used for product titles, section headers, and promotional hero units. Tighten letter-spacing on larger sizes for a more "locked-in" professional look.
- **Body & UI:** Use *Inter*. Chosen for its exceptional legibility at small sizes and its neutral, systematic feel that doesn't compete with the expressive nature of the headlines.
- **Labels:** Use *Inter* in Semi-Bold or Bold with uppercase transformation for navigation, small buttons, and category badges to provide a clear functional distinction from body copy.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. Content is contained within a 1280px max-width container on desktop, centered with generous outer margins.

- **The Grid:** A 12-column grid for desktop, a 6-column grid for tablet, and a 2-column grid for mobile shopping views.
- **Spacing Rhythm:** Based on an 8px base unit. Vertical rhythm should be generous—allow products to "breathe" by using large padding (64px+) between sections.
- **Mobile First:** On mobile, margins reduce to 20px, but internal component padding remains high to maintain the premium, spacious feel.

## Elevation & Depth

To maintain a premium D2C feel, depth is used purposefully rather than decoratively.

- **Tonal Layering:** The primary method of separation. Use subtle shifts between the off-white background and slightly darker containers (#F0EFEF) for secondary information.
- **Shadows:** Use "Ambient Shadows"—extremely soft, large-radius blurs with low opacity (e.g., `0 10px 30px rgba(26, 26, 26, 0.05)`). These should only appear on floating elements like Cart Drawers, Modals, and active Product Cards.
- **Interactive States:** When a user hovers over a product card, a subtle elevation increase or a hairline border is preferred over heavy shadows.

## Shapes

The shape language is refined and "Soft-Modern."

- **Corner Radius:** A standard 8px (`rounded-md`) is applied to buttons, input fields, and product cards. This provides a bridge between geometric minimalism and approachable softness.
- **Large Elements:** Featured containers or hero images may use 16px (`rounded-lg`) to draw attention.
- **Interactive Icons:** Icons and small badges (like "New" or "Sale") should utilize a full pill-shape to contrast against the more structured rectangular components.

## Components

### Buttons
- **Primary:** Solid Deep Charcoal (#1A1A1A) with White text. High-contrast, no shadow, 8px radius.
- **Secondary:** Solid Terracotta (#A45C40) with White text. Used for "Add to Cart" or "Buy Now."
- **Tertiary/Ghost:** Transparent background with a 1px Charcoal border.

### Product Cards
- No border. The image should be the hero, using the off-white background as a frame.
- Typography is left-aligned beneath the image.
- Soft shadow on hover to indicate interactivity.

### Input Fields
- Background-color should match the site background (#F9F8F6) but with a 1px border (#D1D1D1).
- On focus, the border darkens to #1A1A1A.

### Navigation
- **Desktop:** Minimalist top-bar with wide-spaced links. Search and Cart are icon-only to reduce visual clutter.
- **Mobile:** Sticky bottom navigation for key actions (Home, Search, Cart, Account) to improve reachability on large devices.

### Chips & Tags
- Used for sizes, colors, or categories.
- Light gray background with charcoal text. Selected state uses a charcoal background with white text.