# Hosam Dyab - Security Portfolio

[![Live Site](https://img.shields.io/badge/Live-hosamdyab.github.io-2f5edb?style=for-the-badge)](https://hosamdyab.github.io)
[![eJPT](https://img.shields.io/badge/Certified-eJPT-f2c14e?style=for-the-badge)](https://ine.com)
[![Location](https://img.shields.io/badge/Location-Cairo%2C%20Egypt-8b93a3?style=for-the-badge)](https://www.google.com/maps/place/Cairo)

Personal portfolio for **Hosam Dyab**, Junior Penetration Tester and aspiring Security Engineer. A single-page, security-themed site deployed on GitHub Pages.

**Live:** [https://hosamdyab.github.io](https://hosamdyab.github.io)

---

## About

| | |
|---|---|
| **Role** | Junior Penetration Tester → Security Engineer |
| **Certification** | eJPT (INE) |
| **Education** | B.Sc. Computer Science, MTI (Excellent, top-5 class) |
| **Location** | Cairo, Egypt - open to remote & freelance |
| **Email** | [dyabhosamm@gmail.com](mailto:dyabhosamm@gmail.com) |
| **LinkedIn** | [linkedin.com/in/hosamdyab](https://www.linkedin.com/in/hosamdyab) |
| **GitHub** | [github.com/HosamDyab](https://github.com/HosamDyab) |

---

## Project Structure

```
HosamDyab.github.io/
│
├── index.html                 # Page markup (semantic HTML only)
├── README.md                  # Project documentation
├── .gitignore
│
├── css/
│   └── main.css               # All styles, design tokens, responsive rules
│
├── js/
│   └── main.js                # Interactions: nav, terminal, scroll, animations
│
└── assets/
    ├── brand/
    │   ├── logo.png           # Primary brand mark (favicon, nav, footer)
    │   └── logo.svg           # Vector logo
    ├── icons.svg              # SVG icon sprite (mail, github, shield, …)
    ├── images/
    │   ├── profile.jpg        # Hero portrait
    │   ├── flagship-evidence-1.jpg
    │   └── flagship-evidence-2.jpg
    └── files/
        └── hosam-dyab-cv.pdf  # Downloadable CV
```

### Design principles

| Layer | Responsibility |
|---|---|
| `index.html` | Structure, content, accessibility landmarks |
| `css/main.css` | Visual design, layout, motion, breakpoints |
| `js/main.js` | Progressive enhancement (typing, scroll-spy, mobile nav) |
| `assets/` | Static media - never embedded as base64 |

---

## Site Sections

| # | Section | Anchor | File reference |
|---|---|---|---|
| - | Hero | `#top` | `index.html` → `<header class="hero">` |
| 01 | Executive Summary | `#summary` | `<main id="content">` |
| 02 | Scope & Certifications | `#certifications` | |
| 03 | Engagement Log | `#experience` | |
| 04 | Flagship Engagement | `#flagship` | uses `assets/images/flagship-*.jpg` |
| 05 | Additional Engagements | `#projects` | |
| 06 | Toolkit | `#toolkit` | |
| 07 | Credentials & Education | `#education` | |
| - | Contact | `#contact` | `<footer id="contact">` |

---

## Tech Stack

| Layer | Choice |
|---|---|
| Markup | Semantic HTML5 (`<main>`, `<nav>`, `<section>`, `<footer>`) |
| Styling | Vanilla CSS - custom properties, Grid, Flexbox |
| Scripting | Vanilla JavaScript (no frameworks, `defer` load) |
| Icons | External SVG sprite (`assets/icons.svg`) |
| Fonts | Space Grotesk, IBM Plex Sans / Mono (Google Fonts) |
| Hosting | GitHub Pages (static, root deploy) |

---

## Local Development

No build step or dependencies required.

```bash
git clone https://github.com/HosamDyab/HosamDyab.github.io.git
cd HosamDyab.github.io

# Serve locally (pick one)
python -m http.server 8080
npx serve .
```

Open [http://localhost:8080](http://localhost:8080) and edit files directly - refresh to see changes.

---

## Deploy to GitHub Pages

1. Push all files to the `main` branch of `HosamDyab/HosamDyab.github.io`
2. **Settings → Pages** → Source: **Deploy from branch** → `main` / `/ (root)`
3. Site updates at [https://hosamdyab.github.io](https://hosamdyab.github.io) within ~1–2 minutes

> All asset paths are relative (`css/`, `js/`, `assets/`), so the site works at the domain root without configuration changes.

---

## Customization Guide

| Goal | Edit |
|---|---|
| Bio / summary text | `index.html` → `#summary` |
| Add certification | `index.html` → `#certifications` |
| Add project | `index.html` → `#projects` or `#flagship` |
| Colors & spacing | `css/main.css` → `:root` variables |
| Animations / JS behavior | `js/main.js` |
| Replace logo | `assets/brand/logo.png` + `logo.svg` |
| Replace profile photo | `assets/images/profile.jpg` |
| Update CV | Replace `assets/files/hosam-dyab-cv.pdf` |
| Add icon | `assets/icons.svg` → new `<symbol id="i-…">` |
| Contact details | `index.html` → `#contact` + JSON-LD in `<head>` |

---

## Brand Assets

The isometric **H** mark lives in `assets/brand/`:

- **PNG** - favicon, navigation, footer, hero watermark  
- **SVG** - scalable use in docs, print, or future pages  

Icons are centralized in `assets/icons.svg` and referenced as:

```html
<svg class="icon"><use href="assets/icons.svg#i-mail"/></svg>
```

---

## Accessibility

- Skip link → `#content` (main landmark)
- `aria-label` on navigation
- `prefers-reduced-motion` disables typing & scroll animations
- Focus-visible outlines on interactive elements
- Semantic heading hierarchy (`h1` → `h2`)

---

## License

© 2026 Hosam Dyab. Portfolio content and brand assets are personal property.

---

*Built with intent - not a template.*
