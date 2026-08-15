import sharp from 'sharp'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public')

// A cropped stand-in for the marquee: same neon card, same row anatomy
// (year · lit dot · title · peak), seven rows chosen to walk 1997 → 2019.
// Anton isn't available to the SVG renderer, so the display line is heavy
// Helvetica with tight tracking.
const ROWS = [
  { year: '1997', title: 'SHOW ME LOVE', peak: 'US #7', kind: 'hit' },
  { year: '1998', title: '…BABY ONE MORE TIME', peak: '★ #1 US + UK', kind: 'one' },
  { year: '1999', title: 'I WANT IT THAT WAY', peak: '★ #1 UK', kind: 'one' },
  { year: '2008', title: 'I KISSED A GIRL', peak: '★ #1 US + UK', kind: 'one' },
  { year: '2013', title: 'ROAR', peak: '★ #1 US + UK', kind: 'one' },
  { year: '2016', title: "CAN'T STOP THE FEELING!", peak: '★ #1 US', kind: 'one' },
  { year: '2019', title: 'ONE MORE TRY', peak: 'for the show', kind: 'none' },
]

const DOT = { hit: '#f23a95', one: '#ffd60a', none: '#8a6cf0' }
const PEAK = { hit: '#a08fb3', one: '#ffe266', none: '#a68cff' }

const CARD = { x: 56, y: 44, w: 1088, h: 526 }
const PAD = 46
const ROW0 = 300
const STEP = 41

const rows = ROWS.map(({ year, title, peak, kind }, i) => {
  const cy = ROW0 + i * STEP
  return `
  <text x="${CARD.x + PAD}" y="${cy + 6}" font-family="Helvetica, Arial, sans-serif" font-size="17" font-weight="700" fill="#a78bc6">${year}</text>
  <circle cx="${CARD.x + PAD + 74}" cy="${cy}" r="6" fill="${DOT[kind]}" filter="url(#dotGlow)"/>
  <text x="${CARD.x + PAD + 104}" y="${cy + 10}" font-family="Helvetica, Arial, sans-serif" font-size="29" font-weight="700" letter-spacing="0.5" fill="#ffffff" filter="url(#softPink)">${title}</text>
  <text x="${CARD.x + CARD.w - PAD}" y="${cy + 7}" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="19" fill="${PEAK[kind]}">${peak}</text>`
}).join('\n')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#150c20"/>
      <stop offset="1" stop-color="#0a0610"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2a1639"/>
      <stop offset="0.5" stop-color="#1b0f27"/>
      <stop offset="1" stop-color="#12081b"/>
    </linearGradient>
    <linearGradient id="tube" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#f23a95" stop-opacity="0"/>
      <stop offset="0.14" stop-color="#f23a95"/>
      <stop offset="0.5" stop-color="#ffffff"/>
      <stop offset="0.86" stop-color="#f23a95"/>
      <stop offset="1" stop-color="#f23a95" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="bloom" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#f23a95" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#f23a95" stop-opacity="0"/>
    </radialGradient>
    <filter id="bigGlow" x="-60%" y="-160%" width="220%" height="420%">
      <feGaussianBlur stdDeviation="16" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="softPink" x="-20%" y="-80%" width="140%" height="260%">
      <feGaussianBlur stdDeviation="5" result="b"/>
      <feFlood flood-color="#f23a95" flood-opacity="0.65"/>
      <feComposite in2="b" operator="in" result="g"/>
      <feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="dotGlow" x="-300%" y="-300%" width="700%" height="700%">
      <feGaussianBlur stdDeviation="4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <ellipse cx="600" cy="70" rx="620" ry="300" fill="url(#bloom)"/>

  <rect x="${CARD.x}" y="${CARD.y}" width="${CARD.w}" height="${CARD.h}" rx="20"
        fill="url(#card)" stroke="#f23a95" stroke-opacity="0.55" stroke-width="1.5"/>
  <rect x="${CARD.x + 12}" y="${CARD.y - 1}" width="${CARD.w - 24}" height="4" fill="url(#tube)" filter="url(#dotGlow)"/>
  <rect x="${CARD.x + 12}" y="${CARD.y}" width="${CARD.w - 24}" height="2.5" fill="url(#tube)"/>

  <text x="${CARD.x + PAD}" y="${CARD.y + 66}" font-family="Helvetica, Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="6" fill="#ffd60a">&amp; JULIET</text>
  <text x="${CARD.x + PAD - 3}" y="${CARD.y + 140}" font-family="Helvetica, Arial, sans-serif" font-size="66" font-weight="700" letter-spacing="-1" fill="#ffffff" filter="url(#bigGlow)">THE RELEASE TIMELINE</text>
  <text x="${CARD.x + PAD}" y="${CARD.y + 178}" font-family="Helvetica, Arial, sans-serif" font-size="21" fill="#c6aed8">29 pop hits behind &amp; Juliet, in the order they came out.</text>

  <line x1="${CARD.x + PAD}" x2="${CARD.x + CARD.w - PAD}" y1="${CARD.y + 212}" y2="${CARD.y + 212}" stroke="#ffffff" stroke-opacity="0.16"/>
${rows}

  <rect x="0" y="614" width="1200" height="16" fill="#f23a95"/>
  <text x="${CARD.x}" y="${CARD.y + CARD.h + 32}" font-family="Helvetica, Arial, sans-serif" font-size="20" fill="#8d7ba3">drewhoover.com/and-juliet</text>
</svg>`

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(resolve(outDir, 'og.png'))
console.log('og.png written')
