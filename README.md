# Coast and Country Roof Coatings

Static website for Coast and Country Roof Coatings — Bryce Stewart's roof restoration business based in Raymond Terrace, NSW. Servicing Port Stephens, the Hunter Valley, Newcastle and the Central Coast.

Pure HTML / CSS / JS. No build step. No framework. No bundler.

## Folder structure

```
coast-and-country-roof-coatings/
├── index.html             # Long landing page (the only page that converts)
├── service-area.html      # Suburb-specific SEO page (currently Raymond Terrace)
├── thanks.html            # Post-form-submit page
├── css/
│   └── main.css           # Single design-system stylesheet
├── js/
│   └── main.js            # Single IIFE with 21 interactive behaviours
├── images/                # 38 real job photos (no stock photography)
├── README.md              # This file
└── DEPLOY.md              # Step-by-step deployment guide (GitHub + Netlify)
```

## What's in the build

### Brand and palette

- **Brand colours:** Deep navy `#0E2A4F` + bright blue `#2787DB`
- **Neutrals:** Ink `#0B0B0D` + paper `#F5F2ED` + line `#E3DFD8`
- **Fonts:** Big Shoulders Display (display) + Archivo Narrow (UI) + Source Sans 3 (body)

### Visual identity

Distinct from family-template baseline — designed not to look like a copy of the QLD or other NSW sister sites:

- Asymmetric hero with backdrop-blurred navy card overlay and angled spill divider
- Magazine-style services grid: Colorbond Respray spans 4 cols × 2 rows on the brand colour, five smaller service cards arranged around it
- Editorial about section: long-form copy + dedicated stats panel ("The Numbers")
- 4-step vertical-timeline process section with oversized accent numerals
- Structured 4-column footer with credentials line

### Content highlights

- **30 years on roofs** (Bryce's actual experience)
- **Dulux AcraTex Roof Membrane Accredited Applicator** — explicit callout in About
- **Globalcoat industrial primers** + **TSR Industrial Aluminium for iron** mentioned in About
- **6 services:** Colorbond Respray (popular, big card) · Tile Restoration · Terracotta Repaint · Rebedding & Repointing · Soft Wash & Moss Treatment · Heat Reflective Coatings
- **6 real testimonials:** Troy & Jessica, Des & Kathy (from old C&C site) + John, Judy, Hayley, Colleen (from Facebook). First names only for privacy.
- **6 FAQs** including "Can you paint gutters and fascia at the same time?" (genuine question carried over from the old C&C site)
- **24 suburbs across 3 regional groupings:** Port Stephens & Coast / Hunter Valley / Newcastle & Central Coast

### Voice

Punchy, declarative, second-person. "We climb up and measure. You get a fixed quote. We prep properly. You pay when you're happy." No corporate-speak. No fake urgency. No fake review counts.

## What's still placeholder

Items flagged with HTML comments throughout the codebase. Search the source for `PLACEHOLDER` to find them all:

- **Logo file** — currently a wordmark, swap in the chosen logo (one of the 20 mockups) when ready
- **Favicon set** — `images/favicon-32.png`, `favicon-192.png`, `apple-touch-icon.png` referenced but not yet supplied; pages still load fine without them
- **ABN** — currently `ABN XX XXX XXX XXX` in footer, swap in real ABN
- **Auto-playing process video** — `images/process-video.mp4` referenced; placeholder until the clip from the old C&C site is supplied
- **Aerial drone clip** — `images/roof-aerial.mp4` referenced (used in Featured Job section); placeholder until supplied
- **Facebook URL** — currently `https://facebook.com/coastandcountryroofcoatings` in footer, confirm or replace
- **Instagram URL** — currently `https://instagram.com/coastandcountryroofcoatings` in footer, confirm or replace

## Preview locally

The site uses relative paths, so opening `index.html` in a browser usually works. If JS misbehaves (some browsers block `file://` JS), run a local server:

```bash
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Deploy

See `DEPLOY.md` — covers the Claude Code → GitHub → Netlify workflow end-to-end.

## Image compression — recommended pre-launch

Several photos in `images/` are over 1 MB. For production you'll want to:
1. Run them through Squoosh, ImageOptim, or `cwebp` to drop file sizes by 60-80%
2. Target 200-400 KB per photo, 1600px max width

Not blocking deployment — Netlify will serve them fine — but it'll improve mobile load times noticeably.
