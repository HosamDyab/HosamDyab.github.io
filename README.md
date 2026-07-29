# Hosam Dyab - Security Portfolio

[![Live Site](https://img.shields.io/badge/Live-hosamdyab.github.io-2f5edb?style=for-the-badge)](https://hosamdyab.github.io)
[![eJPT](https://img.shields.io/badge/Certified-eJPT-f2c14e?style=for-the-badge)](https://ine.com)
[![Location](https://img.shields.io/badge/Location-Cairo%2C%20Egypt-8b93a3?style=for-the-badge)](https://www.google.com/maps/place/Cairo)

Personal portfolio for **Hosam Dyab**, a Junior Penetration Tester and aspiring Security Engineer. The site is a static GitHub Pages project built with semantic HTML, modular CSS, and modular vanilla JavaScript.

Live site: [https://hosamdyab.github.io](https://hosamdyab.github.io)

## Overview

This repository contains a single-page portfolio designed to present:

- Hosam's security profile and certifications
- practical experience and project work
- a flagship graduation project case study
- recruiter-friendly contact and credibility sections
- polished UI features such as theme switching, command palette, terminal interactions, and animated effects

The project stays static on purpose: no framework, no build step, no backend, and easy deployment to GitHub Pages.

## Project Structure

```text
HosamDyab.github.io/
├── index.html
├── README.md
├── .gitignore
├── css/
│   ├── main.css          # Thin CSS entry file using ordered @import rules
│   ├── base.css          # Tokens, resets, global styles, theme foundations
│   ├── layout.css        # Navigation, hero, structure, footer, responsive layout
│   ├── sections.css      # Section-specific styles (summary, services, proof, FAQ, etc.)
│   ├── motion.css        # Motion styling, hover effects, animation keyframes
│   └── interactive.css   # Filters, forms, command palette, toasts, interactive UI
├── js/
│   ├── core.js           # Shared environment flags (motion, pointer)
│   ├── motion.js         # Boot, cursor, tilt, reveals, counters, role typing
│   ├── navigation.js     # Scroll progress, active nav, anchors, mobile menu
│   ├── ui.js             # Theme, filters, toasts, FAQ, palette, contact UI
│   ├── particles.js      # Canvas particle background
│   └── main.js           # Lightweight note pointing to the split files
└── assets/
    ├── brand/
    ├── files/
    ├── images/
    └── icons.svg
```

## Frontend Architecture

### HTML

[`index.html`](index.html) remains the only page entrypoint so the site stays fully compatible with static GitHub Pages hosting.

### CSS

The styles are split by responsibility:

- [`css/base.css`](css/base.css): design tokens, resets, global defaults, foundational theme values
- [`css/layout.css`](css/layout.css): page-level structure such as nav, hero shell, footer, wrappers, and responsive layout rules
- [`css/sections.css`](css/sections.css): section-specific styling for summary, certifications, services, projects, FAQ, and content blocks
- [`css/motion.css`](css/motion.css): keyframes, hover motion, reveal states, particle/orb behavior, and animation helpers
- [`css/interactive.css`](css/interactive.css): UI controls like contact forms, filters, command palette, modals, copy buttons, and toasts

[`css/main.css`](css/main.css) now acts as the ordered stylesheet entry file.

### JavaScript

The client-side behavior is also split by feature:

- [`js/core.js`](js/core.js): shared runtime flags such as reduced-motion and pointer capability
- [`js/motion.js`](js/motion.js): motion-heavy enhancements like boot screen, cursor, magnetic buttons, tilt, reveals, counters, and role/terminal intro effects
- [`js/navigation.js`](js/navigation.js): scroll progress, scroll spy, back-to-top, smooth anchor navigation, and mobile nav behavior
- [`js/ui.js`](js/ui.js): themes, command palette, project filters, FAQ accordion, clipboard actions, contact form, and other interactive UI logic
- [`js/particles.js`](js/particles.js): the animated network particle background

## Main Sections

The page includes these major content areas:

- `#top` - hero
- `#summary` - executive summary
- `#services` - how Hosam can help
- `#certifications` - certifications and credentials
- `#proof` - recruiter-facing proof points
- `#experience` - engagement log
- `#flagship` - flagship ClassTrack case study
- `#projects` - additional engagements
- `#toolkit` - skills and tools
- `#education` - education and leadership
- `#faq` - hiring FAQ
- `#contact` - contact hub in the footer

## Tech Stack

- HTML5
- Vanilla CSS with custom properties, Grid, Flexbox, and responsive breakpoints
- Vanilla JavaScript loaded with `defer`
- SVG sprite icons from [`assets/icons.svg`](assets/icons.svg)
- Google Fonts: Space Grotesk, IBM Plex Sans, IBM Plex Mono
- GitHub Pages for hosting

## Local Development

No build process or package installation is required.

```bash
git clone https://github.com/HosamDyab/HosamDyab.github.io.git
cd HosamDyab.github.io

# Choose one local server
python -m http.server 8080
npx serve .
```

Then open [http://localhost:8080](http://localhost:8080).

## Deployment

This project is designed for root deployment on GitHub Pages.

1. Push changes to the `main` branch
2. In GitHub, open **Settings -> Pages**
3. Use **Deploy from branch**
4. Select `main` and `/ (root)`

Because all paths are relative, the site works without any bundler or path rewrite step.

## Customization

Use this guide when updating the portfolio:

- Update content sections in [`index.html`](index.html)
- Change colors, tokens, and theme foundations in [`css/base.css`](css/base.css)
- Adjust page structure and spacing in [`css/layout.css`](css/layout.css)
- Edit section-specific visuals in [`css/sections.css`](css/sections.css)
- Tweak animation feel in [`css/motion.css`](css/motion.css) and [`js/motion.js`](js/motion.js)
- Update forms, filters, palette, and other UI behavior in [`css/interactive.css`](css/interactive.css) and [`js/ui.js`](js/ui.js)
- Replace branding assets in [`assets/brand/`](assets/brand/)
- Replace the hero/profile image in [`assets/images/profile.jpg`](assets/images/profile.jpg)
- Replace the downloadable CV in [`assets/files/hosam-dyab-cv.pdf`](assets/files/hosam-dyab-cv.pdf)
- Add or edit SVG icons in [`assets/icons.svg`](assets/icons.svg)

## Accessibility

The site includes:

- a skip link to `#content`
- semantic landmarks and heading structure
- `aria-label` support on major navigation areas
- reduced-motion support for users who prefer less animation
- visible keyboard focus styles
- static-first content that still reads without JavaScript

## Brand Assets

The main visual identity lives in [`assets/brand/`](assets/brand/):

- `logo.png` for favicon, navigation, footer, and hero watermark use
- `logo.svg` for scalable brand use

Icons are centrally defined in [`assets/icons.svg`](assets/icons.svg) and referenced like this:

```html
<svg class="icon"><use href="assets/icons.svg#i-mail"></use></svg>
```

## License

© 2026 Hosam Dyab. Portfolio content and brand assets are personal property unless stated otherwise.

Built with intent - not a template.
