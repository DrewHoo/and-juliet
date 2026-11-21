# & Juliet: The Release Timeline

Every song in the jukebox musical *& Juliet*, in the order it was originally
released — 1997 to 2016 — rendered as a neon marquee. Live at
[drewhoover.com/and-juliet](https://drewhoover.com/and-juliet/).

- 29 covered pop hits + 1 written for the show ("One More Try"), all
  co-written by Max Martin
- Popularity is shown as **chart peak, not streams**: the better of a song's
  US Hot 100 and UK Singles position. Best-of-both matters because
  Billboard's pre-2003 commercial-single rule kept airplay-only releases off
  the Hot 100 entirely — it's the only reason "As Long as You Love Me" and
  "I'm Not a Girl, Not Yet a Woman" have no US number
- Data: Broadway cast recording track list; Billboard, the Official Charts
  Company and Wikipedia for release dates and chart peaks
- Stack: Vite + React, hand-rolled CSS, prerendered to static HTML at build
  time, deployed to GitHub Pages
- Artist wordmarks in `public/artists/` are from Wikimedia Commons (mostly
  PD-textlogo / CC), rendered as white silhouettes via CSS filter

`src/Timeline.jsx` (artist-swimlane bubble chart) and `src/SongTable.jsx` are
kept and still compile, but are not mounted — the page is the marquee alone.

## Develop

```bash
pnpm install
pnpm run dev
```

## Build

`pnpm run build` runs Vite and then `scripts/prerender.mjs`, which renders the
app to static HTML into `#root`, injects `ItemList` / `WebPage` /
`BreadcrumbList` JSON-LD generated from `src/data/songs.js`, and writes
`sitemap.xml`. Without that step the deployed page is an empty `<div>` and
non-JS crawlers see nothing.

## Regenerate assets

```bash
pnpm run gen:favicon
pnpm run gen:og
```

`gen:og` writes two images: `og.png` (1200×630, social unfurls) and `card.png`
(1200×750). The second exists because the drewhoover.com project card crops its
cover to 8:5 with `object-fit: cover` — feeding it the 630-tall OG shaves off
the top and bottom. After regenerating, copy it across:

```bash
cp public/card.png ../DrewHoo.github.io/public/projects/and-juliet.png
```
