# PISH — Purity Is Still Happening

> *"Purity in Heart. Purpose in Life."*

Official website for **PISH (Purity Is Still Happening)** — a youth empowerment non-profit organization based in Nairobi, Kenya, dedicated to promoting sexual purity and purposeful living among young people aged 13–34.

---

## Table of Contents

- [About PISH](#about-pish)
- [Mission, Vision & Values](#mission-vision--values)
- [What the Site Covers](#what-the-site-covers)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Adding Content](#adding-content)
- [SEO & Meta Information](#seo--meta-information)
- [Recordings Archive](#recordings-archive)
- [Attributions](#attributions)

---

## About PISH

PISH (Purity Is Still Happening) is a youth-focused non-profit organization that stands as a beacon of hope in a world where hyper-sexualized media, peer pressure, and aimlessness often cloud the judgment of young people. Through mentorship, education, and community support, PISH empowers youth to embrace sexual purity and purposeful living as deeply interconnected, life-affirming choices.

**Core Belief:**
> *"Purity and purpose are deeply connected: when young people honor their bodies, minds, and spirits through values-based choices, they unlock their potential to live intentionally, serve others, and build meaningful futures."*

**Location:** Nairobi, Kenya  
**Target Age Group:** 13–34 years  
**Contact:** info@pishyouth.org | +254 700 000 000

---

## Mission, Vision & Values

### Mission
To empower young people to embrace sexual purity and purposeful living as interconnected, life-affirming choices — through education, mentorship, and community support — fostering holistic health, personal calling, and future readiness.

### Vision
A generation of youth who are pure in heart, clear in purpose, and empowered to lead values-driven lives that positively impact their families, communities, and the world.

### Core Values

| Value | Description |
|---|---|
| **Purity** | Honoring body, mind, and spirit through intentional choices |
| **Integrity** | Living authentically with honesty and consistency |
| **Purpose** | Discovering and pursuing one's unique calling |
| **Respect** | Valuing the dignity and potential of every individual |
| **Empowerment** | Equipping youth with knowledge and confidence |
| **Community** | Building supportive networks where youth thrive |

---

## What the Site Covers

The website is a single-page application with the following sections:

| Section | Description |
|---|---|
| **Hero** | Full-viewport slideshow with animated headlines and key stats (10,000+ youth reached, 150+ schools, 200+ mentors, 5 programs) |
| **About** | Who PISH is, what they do, and the three pillars: Purity, Purpose, Community |
| **Mission & Vision** | Mission statement, vision statement, and the six core values |
| **The Problem** | Six challenges facing youth today: hyper-sexualized culture, digital distraction, identity confusion, peer pressure, lack of mentorship, emotional/spiritual void |
| **Our Approach** | The Purity-Purpose Connection framework and the four-step Transformation Pathway |
| **Programs** | Four education programs (Purity 101, Purpose Discovery, Life Skills Lab, Health & Wholeness) and three support initiatives (Purpose Partners, Small Groups, Restoration Pathways) |
| **Advocacy** | Movement building: #PureAndPurposeful campaign, school tours, parent equipping, community pledges |
| **Who We Serve** | Adolescents (13–19), Young Adults (20–34), Parents & Guardians, Educators & Youth Workers |
| **Impact** | Expected outcomes across five dimensions: Knowledge, Attitudes, Behaviors, Community, Legacy — with key statistics |
| **Holistic Development** | Four development pillars: Spiritual Growth, Goal Setting, Emotional Intelligence, Service & Leadership |
| **Partners** | Six strategic partnership categories: Educational Institutions, Healthcare Providers, Faith-Based Organizations, Government & NGOs, Corporate Sponsors, Media & Influencers |
| **Join Us** | Three engagement paths: Partner With Us, Donate, Volunteer |
| **Recordings** | Dedicated archive page for past meeting/workshop audio recordings and upcoming session announcements |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | React 18 + TypeScript |
| **Build Tool** | Vite 6 |
| **Styling** | Tailwind CSS v4 + CSS custom properties |
| **UI Components** | shadcn/ui (Radix UI primitives) |
| **Icons** | Lucide React |
| **Fonts** | Playfair Display (headings) · Montserrat (body) via Google Fonts |
| **Animations** | CSS keyframes + IntersectionObserver scroll reveals |
| **Package Manager** | npm / pnpm |

---

## Project Structure

```
src/
├── app/
│   ├── App.tsx               # Root app, Nav, Hero, and all homepage sections
│   ├── RecordingsPage.tsx    # Standalone recordings archive page
│   ├── declarations.d.ts     # Vite static asset type declarations
│   └── components/
│       ├── figma/
│       │   └── ImageWithFallback.tsx
│       └── ui/               # shadcn/ui component library (~45 components)
├── styles/
│   ├── index.css             # Master CSS entry point
│   ├── fonts.css             # Google Fonts imports
│   ├── tailwind.css          # Tailwind v4 directives
│   └── theme.css             # Design token system (CSS custom properties)
└── main.tsx                  # React root entry point

public/
├── PISH_Logo_1.jpeg          # Primary logo
├── PISH_Logo_2.jpeg          # Secondary logo
├── hero_1.png – hero_4.png   # Hero slideshow images
└── RECORDINGS/
    ├── *.mp3                 # Audio recording files
    └── POSTERS/
        └── *.png             # Poster images for each recording
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The site will be available at `http://localhost:5173`.

### Production Build

```bash
npm run build
```

Output is written to the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

---

## Adding Content

### Adding a New Recording

Open `src/app/RecordingsPage.tsx` and add an entry to `PAST_RECORDINGS`:

```ts
{
  id: 3,                                          // unique number
  title: "Your Session Title",
  date: "2026",
  duration: "",                                   // auto-detected on play
  speaker: "Speaker Name",
  description: "A brief description of the session.",
  tags: ["Tag1", "Tag2"],
  src: "/RECORDINGS/YOUR FILE NAME.mp3",          // place MP3 in public/RECORDINGS/
  poster: "/RECORDINGS/POSTERS/your_poster.png",  // place PNG in public/RECORDINGS/POSTERS/
},
```

### Adding an Upcoming Meeting

In the same file, add an entry to `UPCOMING_MEETINGS`:

```ts
{
  id: 1,
  title: "Session Title",
  date: "August 10, 2026",     // format: "Month D, YYYY"
  time: "10:00 AM EAT",
  type: "Workshop",            // Workshop / Seminar / Training / Planning
  venue: "Venue Name",
  poster: "/RECORDINGS/POSTERS/your_poster.png",  // optional
},
```

### Updating Hero Slides

In `src/app/App.tsx`, find the `SLIDES` constant near the top and update the entries. Each slide has:
- `src` — image path (place images in `public/`)
- `headline` — large heading text
- `sub` — italic accent line

---

## SEO & Meta Information

Update `index.html` with the following recommended meta tags for production deployment:

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <!-- Primary Meta -->
  <title>PISH — Purity Is Still Happening | Youth Empowerment, Nairobi Kenya</title>
  <meta name="description"
    content="PISH (Purity Is Still Happening) empowers young people in Kenya to embrace sexual purity and purposeful living through education, mentorship, and community support. Serving youth aged 13–34 across Nairobi and beyond." />
  <meta name="keywords"
    content="PISH, Purity Is Still Happening, youth empowerment Kenya, sexual purity, purposeful living, youth mentorship Nairobi, youth non-profit Kenya, purity education, purpose-driven youth, holistic youth development" />
  <meta name="author" content="PISH — Purity Is Still Happening" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="https://www.pishyouth.org" />

  <!-- Open Graph (Facebook, WhatsApp, LinkedIn) -->
  <meta property="og:type"        content="website" />
  <meta property="og:url"         content="https://www.pishyouth.org" />
  <meta property="og:title"       content="PISH — Purity Is Still Happening" />
  <meta property="og:description" content="Empowering youth in Kenya to embrace sexual purity and purposeful living. Education, mentorship, and community support for ages 13–34." />
  <meta property="og:image"       content="https://www.pishyouth.org/PISH_Logo_1.jpeg" />
  <meta property="og:site_name"   content="PISH" />
  <meta property="og:locale"      content="en_KE" />

  <!-- Twitter Card -->
  <meta name="twitter:card"        content="summary_large_image" />
  <meta name="twitter:title"       content="PISH — Purity Is Still Happening" />
  <meta name="twitter:description" content="Empowering youth in Kenya to embrace sexual purity and purposeful living." />
  <meta name="twitter:image"       content="https://www.pishyouth.org/PISH_Logo_1.jpeg" />

  <!-- Geo -->
  <meta name="geo.region"   content="KE-30" />
  <meta name="geo.placename" content="Nairobi, Kenya" />

  <!-- Theme -->
  <meta name="theme-color" content="#1E3A5F" />
  <link rel="icon" type="image/jpeg" href="/PISH_Logo_1.jpeg" />
</head>
```

### Recommended SEO Checklist

- [ ] Replace `https://www.pishyouth.org` with the real production domain everywhere above
- [ ] Add a `sitemap.xml` at the root for search engine crawling
- [ ] Add a `robots.txt` to control crawler access
- [ ] Submit the sitemap to Google Search Console
- [ ] Register the site on Google My Business (Nairobi, Kenya listing)
- [ ] Use the `#PureAndPurposeful` hashtag consistently on all social media to build branded search volume
- [ ] Add structured data (`application/ld+json`) for the Organization schema:

```json
{
  "@context": "https://schema.org",
  "@type": "NGO",
  "name": "PISH — Purity Is Still Happening",
  "alternateName": "PISH",
  "url": "https://www.pishyouth.org",
  "logo": "https://www.pishyouth.org/PISH_Logo_1.jpeg",
  "description": "Youth empowerment non-profit promoting sexual purity and purposeful living among young people aged 13–34 in Kenya.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Nairobi",
    "addressCountry": "KE"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+254-700-000-000",
    "email": "info@pishyouth.org",
    "contactType": "General Enquiries"
  },
  "sameAs": [
    "https://twitter.com/pishyouth",
    "https://instagram.com/pishyouth",
    "https://facebook.com/pishyouth"
  ]
}
```

---

## Recordings Archive

The recordings page (`/recordings`) is a standalone component at `src/app/RecordingsPage.tsx`. It is intentionally admin-managed — there is no public upload interface. To publish a new recording:

1. Place the `.mp3` file in `public/RECORDINGS/`
2. Place the session poster (`.png` or `.jpg`) in `public/RECORDINGS/POSTERS/`
3. Add the entry to `PAST_RECORDINGS` in `RecordingsPage.tsx`
4. Redeploy the site

The audio player supports real playback, animated waveform visualization, and progress tracking directly in the browser.

---

## Attributions

- **UI Components:** [shadcn/ui](https://ui.shadcn.com) — MIT License
- **Icons:** [Lucide React](https://lucide.dev) — ISC License
- **Fonts:** [Google Fonts](https://fonts.google.com) — Playfair Display, Montserrat (SIL Open Font License)
- **Stock Photography:** [Unsplash](https://unsplash.com) — Unsplash License
- **Build Tooling:** [Vite](https://vitejs.dev) — MIT License

See [ATTRIBUTIONS.md](./ATTRIBUTIONS.md) for full credits.

---

## Design Colors

| Token | Hex | Usage |
|---|---|---|
| Primary (Navy) | `#1E3A5F` | Backgrounds, headers, buttons |
| Secondary (Teal) | `#4A90A4` | Accents, links, approach section |
| Accent (Gold) | `#D4A574` | CTAs, highlights, logo ring |
| Background | `#FDFAF6` | Page background (warm cream) |
| Muted | `#F0EBE3` | Card backgrounds, soft sections |

---

*© 2026 PISH — Purity Is Still Happening. All rights reserved. Nairobi, Kenya.*
