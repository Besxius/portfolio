---
trigger: always_on
description: Rule cốt lõi bắt buộc về thiết kế web. AI agent PHẢI tuân thủ 100% khi tạo/chỉnh sửa file web.
globs: "**/*.{html,css,js,jsx,tsx,ts,vue,svelte,astro}"
---

---
description: Mandatory high-grade web design backbone rules and visual execution guidelines.
globs: "**/*.{html,css,js,jsx,tsx,ts,vue,svelte,astro}"
trigger: always_on
---

# Web Design Backbone & Visual Engineering Standard

> **NON-NEGOTIABLE RULE:** Every web interface generated or edited MUST strictly adhere 100% to this system. Any generic, plain, or unpolished output is considered a **FAILED** build.

---

## 1. Design Philosophy

* **Premium First:** Aim for visual excellence out of the box. The UI must impress immediately with modern aesthetics, balanced whitespace, and high polish.
* **Alive & Responsive:** Static UI is strictly prohibited. Elements must feel responsive, offering subtle state transitions, micro-interactions, and visual feedback on user actions.
* **Benchmark Standard:** Measure output against modern industry benchmarks (e.g., Apple, Stripe, Linear, Vercel). If it resembles a standard default template or student assignment, refine it.

---

## 2. Layout, Grid & Spatial System

* **Modern Layout Engines Only:** Exclusively use **CSS Grid** and **Flexbox**. Float-based layouts and HTML tables for layout positioning are strictly forbidden.
* **Max-Container Standard:** Standard content wrappers must be constrained to `max-width: 1200px` to `1400px` with `margin: 0 auto`.
* **Spatial Rhythm (8pt System):** All spacing (padding, margin, gap) must strictly use multiples of 4px/8px:
  `4px | 8px | 12px | 16px | 24px | 32px | 48px | 64px | 80px | 96px | 128px`
* **Section Padding:**
  * Desktop: `padding-top/bottom >= 80px`
  * Mobile: `padding-top/bottom >= 48px`
* **Prohibited:** Arbitrary odd numbers (e.g., `7px`, `13px`) and unmanaged `position: absolute` declarations.

---

## 3. Typography & Hierarchy

* **Google Fonts Standard:** Never use browser default system fonts. Always import and apply carefully curated Google Fonts:
  * **Modern / Tech:** *Inter*, *Plus Jakarta Sans*, *Outfit*, *Space Grotesk*
  * **Elegant / Premium:** *Playfair Display*, *Cormorant Garamond*
  * **Friendly / Approachable:** *Poppins*, *DM Sans*, *Nunito*
* **Font Count Limit:** Maximum of **2 font families** per project (one for Headings, one for Body).
* **Line Heights & Tracking:**
  * Body text: `line-height: 1.6` to `1.8`
  * Headings: `line-height: 1.1` to `1.3`
  * Display Headings: Slight negative tracking (`letter-spacing: -0.02em`)
* **Visual Hierarchy:** Distinct weight distribution (`400`, `500`, `600`, `700`). Body text must never drop below `14px`.

---

## 4. Color Architecture & Design Tokens

* **CSS Custom Properties Required:** All color definitions must be declared as design tokens in `:root`:

```css
:root {
  /* Brand / Accent */
  --color-primary: #4f46e5;
  --color-primary-light: #6366f1;
  --color-primary-dark: #4338ca;
  --color-accent: #0ea5e9;

  /* Neutral Scale */
  --color-slate-50: #f8fafc;
  --color-slate-100: #f1f5f9;
  --color-slate-800: #1e293b;
  --color-slate-900: #0f172a;
  --color-slate-950: #020617;

  /* Functional Surfaces */
  --color-bg: var(--color-slate-950);
  --color-surface: #0f172a;
  --color-surface-elevated: #1e293b;
  --color-border: rgba(255, 255, 255, 0.08);

  /* Typography Colors */
  --color-text-primary: #f8fafc;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;
}
```

* **Color Constraints:**
  * Never use raw primary colors (`#ff0000`, `#0000ff`).
  * Dark mode backgrounds must use deep slates/charcoals (`#0f0f0f` to `#18181b`), never pure `#000000`.
  * Ensure WCAG AA contrast ratio standards (minimum 4.5:1 for body text).
  * Palette limit: Maximum 3 primary colors (1 Brand Primary + 1-2 Secondary Accents).

---

## 5. Elevation, Depth & Surface Treatment

* **Elevation Scale:** Implement structured box shadows ranging from subtle `xs` elevation to prominent `2xl` overlays.
* **Glassmorphism:** Use clean glass cards on dark/tinted backgrounds:
  ```css
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  ```
* **Glow Accents:** Use subtle multi-layered glows for primary call-to-actions:
  `box-shadow: 0 0 24px -4px rgba(79, 70, 229, 0.4);`

---

## 6. Motion, Transitions & Micro-Interactions

* **Mandatory State Transitions:** Every interactive element (`button`, `a`, `card`, `input`) must include smooth state transitions:
  ```css
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1),
              background-color 0.2s ease,
              border-color 0.2s ease;
  ```
* **Hover Dynamics:**
  * Buttons: `transform: translateY(-2px);` with increased elevation/glow.
  * Cards: Slight lift (`translateY(-4px)`) and border highlight.
* **Smooth Scrolling:** `html { scroll-behavior: smooth; }`
* **Accessibility Motion Fallback:**
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
  ```

---

## 7. Responsive Engineering & Breakpoints

* **Mobile-First Approach:** Base CSS targets mobile viewport first, scaling up via `min-width` queries.
* **Standard Breakpoints:**
  * Mobile: `< 640px`
  * Tablet: `640px`
  * Laptop: `1024px`
  * Desktop: `1280px`
  * Wide Desktop: `1536px`
* **Fluid Typography:** Scale key display titles smoothly using CSS clamp:
  `font-size: clamp(2.25rem, 5vw + 1rem, 4.5rem);`
* **Touch Targets:** Minimum interactive area of `44px x 44px` on touch viewports.
* **No Horizontal Overflow:** `max-width: 100%` on imagery and elements. Horizontal scrolling on mobile is strictly prohibited.

---

## 8. Core Component Patterns

* **Navigation Bar:** Sticky header, glass backdrop blur, clean brand alignment, clear CTA, responsive drawer for mobile.
* **Hero Section:** Height >= `80vh`, gradient highlight text, focused single H1, maximum width subtext (`600px`), dual primary/secondary action buttons.
* **Cards:** Border-radius `12px` to `20px`, internal padding `24px` to `32px`, elevation shift on hover.
* **Buttons:** Padding `12px 28px`, border-radius `8px` or pill (`9999px`), bold weight (`600`), hover lift.
* **Footer:** Multi-column grid, contrast background, clear taxonomy, copyright and legal metadata.

---

## 9. Asset & Content Guidelines

* **No Empty Placeholders:** Use real or meaningful placeholder content. Never output generic "Lorem Ipsum".
* **Image Delivery:** Implement `loading="lazy"` on all below-the-fold images. Always supply descriptive `alt` attributes.
* **Iconography:** Exclusively use modern vector SVG icons (inline SVG or standard icon libraries like Lucide, Phosphor, Heroicons). PNG/JPG icons are strictly prohibited.

---

## 10. Accessibility & Technical SEO

* **Semantic HTML Structure:** Always structure layouts using `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, and `<footer>`.
* **Heading Hierarchy:** Exactly one `<h1>` per page. Heading tags must proceed sequentially (`h1` -> `h2` -> `h3`).
* **Focus States:** Never set `outline: none` without providing a high-visibility custom focus ring.
* **ARIA & Forms:** Provide explicit `<label>` tags for form inputs and `aria-label` attributes for icon-only buttons.
* **SEO Meta:** Include essential `<meta>` tags: `charset`, `viewport`, `title`, `description`, OpenGraph tags (`og:title`, `og:image`), and favicon.

---

## 11. Pre-Flight UI Checklist

Before marking any web page or component phase complete, verify:
- [ ] Premium aesthetic with consistent CSS custom properties?
- [ ] Google Fonts imported with clear visual hierarchy?
- [ ] 8pt spacing system strictly maintained?
- [ ] Interactive states (hover/active/focus) on all buttons, links, and cards?
- [ ] Responsive testing passed at 375px, 768px, 1024px, and 1440px without horizontal scroll?
- [ ] Semantic HTML and accessibility requirements satisfied?
- [ ] `prefers-reduced-motion` block present?