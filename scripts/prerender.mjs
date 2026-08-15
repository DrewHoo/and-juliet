// Bakes the rendered app into dist/index.html after `vite build`.
//
// Without this the deployed page is `<div id="root"></div>` and nothing else:
// every word of it — 30 song titles, the artists, the chart peaks, the intro —
// exists only after React runs. Google will usually render JS eventually, but
// it's a deferred second pass, and Bing, DuckDuckGo, social unfurlers and the
// LLM crawlers largely won't. Prerendering makes the content plain HTML.
//
// Also emits the JSON-LD, generated from the same SONGS array the page renders,
// so the structured data can't drift from what's actually on screen.
import { createServer } from 'vite'
import { renderToString } from 'react-dom/server'
import React from 'react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SITE = 'https://drewhoover.com/and-juliet/'
const OUT = path.join(ROOT, 'dist/index.html')

const vite = await createServer({
  root: ROOT,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'warn',
})
const { default: App } = await vite.ssrLoadModule('/src/App.jsx')
const { SONGS } = await vite.ssrLoadModule('/src/data/songs.js')
const appHtml = renderToString(React.createElement(App))
await vite.close()

const byDate = [...SONGS].sort((a, b) => a.date.localeCompare(b.date))

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': SITE,
      url: SITE,
      name: '& Juliet Songs in Release Order',
      description:
        'Every song in the musical & Juliet listed in the order it was originally released, with the chart peak each one hit.',
      isPartOf: { '@type': 'WebSite', url: 'https://drewhoover.com/', name: 'drewhoover.com' },
      about: {
        '@type': 'TheaterEvent',
        name: '& Juliet',
        description:
          'Jukebox musical scored with pop songs co-written by Max Martin, in which Juliet survives the end of Romeo and Juliet.',
      },
      mainEntity: { '@id': `${SITE}#songs` },
    },
    {
      '@type': 'ItemList',
      '@id': `${SITE}#songs`,
      name: 'Songs in & Juliet, in release order',
      numberOfItems: byDate.length,
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: byDate.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'MusicRecording',
          name: s.title,
          byArtist: { '@type': 'MusicGroup', name: s.original ? 'Jessie J' : s.artist },
          datePublished: s.date,
          ...(s.album ? { inAlbum: { '@type': 'MusicAlbum', name: s.album } } : {}),
        },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'drewhoover.com', item: 'https://drewhoover.com/' },
        { '@type': 'ListItem', position: 2, name: '& Juliet Songs in Release Order', item: SITE },
      ],
    },
  ],
}

let html = fs.readFileSync(OUT, 'utf8')

if (!html.includes('<div id="root"></div>')) {
  throw new Error('prerender: could not find an empty #root in dist/index.html')
}
html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)
html = html.replace(
  '</head>',
  `  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n  </head>`,
)

fs.writeFileSync(OUT, html)

// Single-page sitemap. Worth little on its own, but it is what Search Console
// wants submitted, and it carries lastmod.
const lastmod = new Date().toISOString().slice(0, 10)
fs.writeFileSync(
  path.join(ROOT, 'dist/sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>
</urlset>
`,
)

const words = appHtml.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
console.log(`prerendered ${(appHtml.length / 1024).toFixed(0)}KB into #root (~${words} words), ${byDate.length} songs in JSON-LD, sitemap.xml written`)
