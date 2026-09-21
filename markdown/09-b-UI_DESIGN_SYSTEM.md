# UI Design System — Commercial Real Estate Website
> Design reference for "Пространство" (Prostranstvo) — a commercial real estate agency

---

## Brand Identity

**Brand name:** Пространство (Prostranstvo)  
**Tagline:** Коммерческая недвижимость / Commercial Real Estate  
**Tone:** Professional, trustworthy, clean — conveys expertise without being cold

---

## Color Palette

```
--color-bg-page:       #D6E4EF   /* Steel blue page background */
--color-bg-surface:    #FFFFFF   /* Card and section backgrounds */
--color-bg-overlay:    #F0F6FA   /* Light tinted sections */
--color-accent:        #3A7CA5   /* Primary blue — buttons, highlights */
--color-accent-dark:   #2B5F80   /* Hover states, active elements */
--color-accent-light:  #C2D9EA   /* Badge backgrounds, subtle accents */
--color-text-primary:  #1A1A2E   /* Headings, strong body text */
--color-text-body:     #3D4A5C   /* General body copy */
--color-text-muted:    #7A8BA0   /* Labels, captions, subtext */
--color-text-inverse:  #FFFFFF   /* Text on dark/accent backgrounds */
--color-border:        #D0DDE8   /* Dividers, card outlines */
--color-stat-label:    #5A7A90   /* Stat labels below numbers */
```

---

## Typography

### Typefaces
- **Primary (headings):** `Inter` or `Golos Text` — weight 700 for display, 600 for section headers
- **Body:** `Inter` — weight 400 for paragraphs, 500 for UI labels
- **Fallback stack:** `system-ui, -apple-system, sans-serif`

> Use Google Fonts: `Golos+Text:wght@400;600;700` for a slightly more distinctive Russian-language feel than Inter.

### Type Scale

| Token           | Size     | Weight | Line-height | Usage                          |
|-----------------|----------|--------|-------------|--------------------------------|
| `--text-hero`   | 48–56px  | 700    | 1.1         | Hero headline                  |
| `--text-h1`     | 36–42px  | 700    | 1.2         | Page section titles            |
| `--text-h2`     | 28px     | 600    | 1.25        | Card/block headings            |
| `--text-h3`     | 20px     | 600    | 1.3         | Sub-headings, step labels      |
| `--text-body`   | 15–16px  | 400    | 1.6         | Paragraphs, descriptions       |
| `--text-small`  | 13px     | 400    | 1.5         | Captions, meta labels          |
| `--text-stat`   | 40–48px  | 700    | 1.0         | Key metric numbers             |
| `--text-btn`    | 15px     | 600    | 1           | Button labels                  |

### Line Length
- Body text: max `62ch` (≈ 65 characters)  
- Section descriptions: max `48ch` on desktop, full width on mobile

---

## Spacing System

Based on a 4px base unit:

```
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-6:   24px
--space-8:   32px
--space-10:  40px
--space-12:  48px
--space-16:  64px
--space-20:  80px
--space-24:  96px
```

**Section vertical padding:** `--space-16` to `--space-20` (64–80px desktop), `--space-12` (48px mobile)

---

## Border Radius

```
--radius-sm:   4px    /* Tags, badges */
--radius-md:   8px    /* Buttons, inputs */
--radius-lg:   12px   /* Cards */
--radius-xl:   16px   /* Image containers */
--radius-full: 9999px /* Pills, circular icons */
```

---

## Elevation / Shadow

```
--shadow-card:    0 2px 12px rgba(30, 60, 90, 0.08)
--shadow-card-hover: 0 6px 24px rgba(30, 60, 90, 0.14)
--shadow-nav:     0 2px 8px rgba(30, 60, 90, 0.10)
```

Cards should transition shadow on hover: `transition: box-shadow 200ms ease`.

---

## Layout

### Grid

```css
/* Desktop */
--grid-max-width: 1200px;
--grid-columns: 12;
--grid-gap: 24px;
--grid-margin: 40px; /* side padding */

/* Tablet (768–1024px) */
--grid-columns: 8;
--grid-gap: 20px;
--grid-margin: 24px;

/* Mobile (< 768px) */
--grid-columns: 4;
--grid-gap: 16px;
--grid-margin: 16px;
```

### Breakpoints

```
--bp-mobile:  480px
--bp-tablet:  768px
--bp-desktop: 1024px
--bp-wide:    1280px
```

### ASCII Layout — Desktop

```
┌──────────────────────────────────────────────┐
│  NAV  [Logo]  О нас · Каталог · Этапы · Конт │
├──────────────────────────────────────────────┤
│  HERO  [Full-width image + overlay headline] │
│        Headline                              │
│        Subtext                               │
│        [CTA Button]                          │
├──────────────────────────────────────────────┤
│  ABOUT    [Stats: 10+ | 1000+ | 4000+ | 95%] │
│  [Text left 4 cols] [Stats right 8 cols]     │
├──────────────────────────────────────────────┤
│  PARTNERS  [Logo strip — 5 logos, full width]│
├──────────────────────────────────────────────┤
│  CATALOG   [Heading left] [3 image cards →]  │
│  [Carousel with nav arrows]                  │
├──────────────────────────────────────────────┤
│  HOW WE WORK                                 │
│  [Image left] [5 step list right]            │
│  [Floating badge: "Бесплатная консультация"] │
├──────────────────────────────────────────────┤
│  TESTIMONIALS  [Quote cards carousel]        │
├──────────────────────────────────────────────┤
│  CTA BANNER  [Full-width, accent bg]         │
├──────────────────────────────────────────────┤
│  FOOTER  [Logo + nav + contacts]             │
└──────────────────────────────────────────────┘
```

### ASCII Layout — Mobile

```
┌────────────────────┐
│ [Logo]         [≡] │  ← Hamburger nav
├────────────────────┤
│ HERO full-width    │
│ headline + CTA     │
├────────────────────┤
│ ABOUT text block   │
│ Stats 2×2 grid     │
├────────────────────┤
│ PARTNERS scroll →  │
├────────────────────┤
│ CATALOG            │
│ Cards stack vert.  │
├────────────────────┤
│ HOW WE WORK        │
│ Steps stacked      │
├────────────────────┤
│ TESTIMONIALS       │
├────────────────────┤
│ CTA BANNER         │
├────────────────────┤
│ FOOTER stacked     │
└────────────────────┘
```

---

## Components

### Navigation

- Background: `--color-bg-surface` with `--shadow-nav`
- Logo: brand mark + wordmark, left-aligned
- Links: `--text-body`, `--color-text-body`, hover → `--color-accent`
- Active link: `--color-accent`, weight 600
- CTA button in nav (optional): filled accent button
- Mobile: hamburger toggle (`≡`), full-screen drawer or slide-down panel

```
Height desktop: 64px
Height mobile:  56px
Position: sticky top: 0, z-index: 100
```

---

### Hero Section

- Full-width image with a **dark gradient overlay** (left side, `rgba(15,30,50,0.55)`)
- Headline: `--text-hero`, `--color-text-inverse`
- Subtext: `--text-body`, `--color-text-inverse`, opacity 0.85
- CTA button: Primary (see Buttons)
- Min-height: `540px` desktop, `420px` tablet, `320px` mobile
- Image: cover fit, center-top anchor

---

### Buttons

#### Primary
```css
background: var(--color-accent);
color: var(--color-text-inverse);
border-radius: var(--radius-md);
padding: 12px 28px;
font-size: var(--text-btn);
font-weight: 600;
border: none;
transition: background 180ms ease;

&:hover { background: var(--color-accent-dark); }
```

#### Secondary / Outline
```css
background: transparent;
color: var(--color-accent);
border: 1.5px solid var(--color-accent);
border-radius: var(--radius-md);
padding: 11px 28px;

&:hover {
  background: var(--color-accent-light);
}
```

#### Ghost (light, on dark bg)
```css
background: rgba(255,255,255,0.15);
color: white;
border: 1.5px solid rgba(255,255,255,0.5);
```

---

### Stat Block

Used in About section and mobile summary.

```
┌──────────────┐
│  4000+       │  ← --text-stat, --color-accent
│  объектов    │  ← --text-small, --color-stat-label
│  в нашей базе│
└──────────────┘
```

- Stats layout: 4-column row on desktop, 2×2 on mobile
- Numbers: large, weight 700, color `--color-text-primary`
- "+" or "%" suffix: same weight, same color
- Label below: `--text-small`, `--color-text-muted`

---

### Property Card

Used in catalog carousel.

```
┌──────────────────┐
│  [Image 16:9]    │  ← border-radius top only
├──────────────────┤
│  Офисные         │  ← --text-h3
│  помещения       │
│  4000+ объектов  │  ← --text-small, muted
└──────────────────┘
```

- Background: `--color-bg-surface`
- Shadow: `--shadow-card`
- Radius: `--radius-lg`
- Hover: `--shadow-card-hover`, slight `translateY(-2px)`
- Image: `aspect-ratio: 16/9`, `object-fit: cover`

---

### Process Step

Used in "Как мы работаем" (How We Work) section.

```
[●] Step title           ← icon (circle bg --color-accent-light, icon --color-accent)
    Short description    ← --text-body
```

- Icon container: 40×40px, `border-radius: 50%`, `background: --color-accent-light`
- Connecting line between steps (desktop): `1px solid --color-border`, vertical
- No numbered markers — these are method steps, not a strict sequence

---

### Testimonial Card

```
┌─────────────────────────┐
│ "  quote text here  "   │  ← large opening quote glyph, --color-accent
│                         │
│ [Avatar] Name           │  ← --text-h3
│          Role/company   │  ← --text-small, muted
└─────────────────────────┘
```

- Background: `--color-bg-surface`
- Border-left: `3px solid --color-accent`
- Padding: `--space-8`

---

### Floating Badge

Used over image in "How we work" section.

```css
background: var(--color-accent);
color: var(--color-text-inverse);
border-radius: var(--radius-full);
padding: 16px 20px;
text-align: center;
font-size: 14px;
font-weight: 600;
position: absolute;
box-shadow: var(--shadow-card);
```

---

### Partner Logo Strip

- Horizontal flex row, `gap: --space-8`
- Logos: grayscale filter `0.6`, hover → full color
- On mobile: horizontal scroll (`overflow-x: auto`, hide scrollbar)

---

### CTA Banner

Full-width section with accent background.

```
background: var(--color-accent);
color: white;
padding: var(--space-16) var(--space-6);
text-align: center;
```

- Heading: `--text-h1`, white
- Subtext: `--text-body`, white 85% opacity
- Button: Ghost style (white border)

---

### Form Inputs

```css
border: 1.5px solid var(--color-border);
border-radius: var(--radius-md);
padding: 12px 16px;
font-size: var(--text-body);
color: var(--color-text-primary);
background: var(--color-bg-surface);

&:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(58, 124, 165, 0.15);
}
```

---

### Footer

- Background: `--color-text-primary` (dark)
- Text: `--color-text-inverse` and muted white (`rgba(255,255,255,0.6)`)
- Layout: logo + tagline left, nav links center, contact info right
- Mobile: stacked single column
- Border-top: `1px solid rgba(255,255,255,0.1)`

---

## Iconography

- Style: **outline icons**, 24×24px
- Stroke: 1.5px
- Color: `--color-accent` on light backgrounds, `white` on dark
- Recommended library: **Lucide** or **Phosphor** (both have good Cyrillic-adjacent icon sets)

---

## Imagery Guidelines

- Photography: architectural, modern commercial buildings — exteriors and interiors
- Color grading: cool-neutral tones, slight blue cast — matches the palette
- Always use `object-fit: cover` with a defined aspect ratio container
- Overlay gradient on hero images: `linear-gradient(90deg, rgba(15,30,50,0.65) 40%, transparent 100%)`
- Alt text: descriptive, e.g. "Современное офисное здание в деловом районе"

---

## Motion Principles

- **One orchestrated moment:** page-load fade-in of the hero content (300ms, `opacity 0 → 1`)
- **Action responses only:** button press → slight scale `0.97`, carousel slide → `translate` transition 300ms `ease-in-out`
- **No scroll-triggered animations** on every section — these read as generic
- **Reduced motion:** all transitions wrapped in `@media (prefers-reduced-motion: reduce) { transition: none }`

---

## Accessibility

- Minimum contrast: 4.5:1 for body text, 3:1 for large text against backgrounds
- All interactive elements: visible `:focus-visible` ring (`outline: 2px solid --color-accent; outline-offset: 2px`)
- Images: meaningful `alt` attributes
- Buttons with icon-only: `aria-label` required
- Navigation: `<nav aria-label="Главное меню">`
- Carousel: keyboard arrow navigation, `aria-live="polite"` for updates

---

## Responsive Behavior Summary

| Element         | Desktop              | Tablet               | Mobile              |
|-----------------|----------------------|----------------------|---------------------|
| Nav             | Horizontal links     | Horizontal, compact  | Hamburger drawer    |
| Hero            | Text + image split   | Text overlay         | Full image + overlay|
| About stats     | 4-col row            | 2×2 grid             | 2×2 grid            |
| Catalog cards   | 3-up carousel        | 2-up carousel        | 1-up, vertical      |
| Process steps   | 2-col (image + list) | 2-col compressed     | Single column       |
| Footer          | 3-col                | 2-col                | Stacked             |
| Font: hero      | 56px                 | 42px                 | 32px                |
| Font: h1        | 42px                 | 34px                 | 28px                |

---

## CSS Custom Properties — Quick Reference

```css
:root {
  /* Colors */
  --color-bg-page:       #D6E4EF;
  --color-bg-surface:    #FFFFFF;
  --color-bg-overlay:    #F0F6FA;
  --color-accent:        #3A7CA5;
  --color-accent-dark:   #2B5F80;
  --color-accent-light:  #C2D9EA;
  --color-text-primary:  #1A1A2E;
  --color-text-body:     #3D4A5C;
  --color-text-muted:    #7A8BA0;
  --color-text-inverse:  #FFFFFF;
  --color-border:        #D0DDE8;
  --color-stat-label:    #5A7A90;

  /* Typography */
  --font-main: 'Golos Text', system-ui, sans-serif;
  --text-hero:  clamp(32px, 5vw, 56px);
  --text-h1:    clamp(28px, 4vw, 42px);
  --text-h2:    clamp(22px, 3vw, 28px);
  --text-h3:    20px;
  --text-body:  16px;
  --text-small: 13px;
  --text-stat:  clamp(32px, 4vw, 48px);
  --text-btn:   15px;

  /* Spacing */
  --space-1:  4px;  --space-2:  8px;
  --space-3:  12px; --space-4:  16px;
  --space-6:  24px; --space-8:  32px;
  --space-10: 40px; --space-12: 48px;
  --space-16: 64px; --space-20: 80px;

  /* Shape */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;

  /* Elevation */
  --shadow-card:       0 2px 12px rgba(30,60,90,0.08);
  --shadow-card-hover: 0 6px 24px rgba(30,60,90,0.14);
  --shadow-nav:        0 2px 8px rgba(30,60,90,0.10);

  /* Layout */
  --grid-max-width: 1200px;
  --grid-gap:       24px;
  --grid-margin:    40px;
}

@media (max-width: 768px) {
  :root {
    --grid-gap:    16px;
    --grid-margin: 16px;
  }
}
```

---

*This document is the single source of truth for all visual decisions. Every page, component, and feature built for this project must reference these tokens. When in doubt, ask: does this choice reflect the steel-blue, professional, spacious identity of Пространство — or does it feel generic?*
