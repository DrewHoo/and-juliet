import sharp from 'sharp'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public')

// A cropped stand-in for the marquee: same neon field, same row anatomy
// (year · lit dot · title · peak). Anton isn't available to the SVG renderer,
// so the display line is heavy Helvetica with tight tracking.
//
// Two outputs, because they get cropped differently:
//   og.png    1200×630  — social unfurls, shown uncropped
//   card.png  1200×750  — the drewhoover.com project card, whose <img> is
//                         `aspect-ratio: 8/5; object-fit: cover`. Feeding it a
//                         630-tall image means the top and bottom get shaved
//                         off, so this one is built at 8:5 to survive intact.
const ROWS = [
  { year: '1997', title: 'SHOW ME LOVE', peak: 'US #7', kind: 'hit' },
  { year: '1998', title: '…BABY ONE MORE TIME', peak: '★ #1 US + UK', kind: 'one' },
  { year: '1999', title: 'I WANT IT THAT WAY', peak: '★ #1 UK', kind: 'one' },
  { year: '2000', title: "IT'S GONNA BE ME", peak: '★ #1 US', kind: 'one' },
  { year: '2004', title: 'SINCE U BEEN GONE', peak: 'US #2', kind: 'hit' },
  { year: '2008', title: 'I KISSED A GIRL', peak: '★ #1 US + UK', kind: 'one' },
  { year: '2011', title: 'DOMINO', peak: '★ #1 UK', kind: 'one' },
  { year: '2013', title: 'ROAR', peak: '★ #1 US + UK', kind: 'one' },
  { year: '2016', title: "CAN'T STOP THE FEELING!", peak: '★ #1 US', kind: 'one' },
  { year: '2019', title: 'ONE MORE TRY', peak: 'for the show', kind: 'none' },
]

// og.png can't fit all ten and still breathe, so it takes a spread of seven.
const OG_ROWS = [0, 1, 2, 5, 7, 8, 9]

const DOT = { hit: '#f23a95', one: '#ffd60a', none: '#8a6cf0' }
const PEAK = { hit: '#a08fb3', one: '#ffe266', none: '#a68cff' }

const PAD = 46

function svg({ W, H, cardH, rows, row0, step, sub }) {
  const card = { x: 56, y: 44, w: W - 112, h: cardH }
  const lastRow = row0 + (rows.length - 1) * step
  if (lastRow + 18 > card.y + card.h) {
    throw new Error(`${W}×${H}: last row at ${lastRow} overflows card bottom ${card.y + card.h}`)
  }
  const left = card.x + PAD
  const right = card.x + card.w - PAD

  const list = rows
    .map(({ year, title, peak, kind }, i) => {
      const cy = row0 + i * step
      return `
  <text x="${left}" y="${cy + 6}" font-family="Helvetica, Arial, sans-serif" font-size="17" font-weight="700" fill="#a78bc6">${year}</text>
  <circle cx="${left + 74}" cy="${cy}" r="6" fill="${DOT[kind]}" filter="url(#dotGlow)"/>
  <text x="${left + 104}" y="${cy + 10}" font-family="Helvetica, Arial, sans-serif" font-size="29" font-weight="700" letter-spacing="0.5" fill="#ffffff" filter="url(#softPink)">${title}</text>
  <text x="${right}" y="${cy + 7}" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="19" fill="${PEAK[kind]}">${peak}</text>`
    })
    .join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
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

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <ellipse cx="${W / 2}" cy="70" rx="${W * 0.52}" ry="300" fill="url(#bloom)"/>

  <rect x="${card.x}" y="${card.y}" width="${card.w}" height="${card.h}" rx="20"
        fill="url(#card)" stroke="#f23a95" stroke-opacity="0.55" stroke-width="1.5"/>
  <rect x="${card.x + 12}" y="${card.y - 1}" width="${card.w - 24}" height="4" fill="url(#tube)" filter="url(#dotGlow)"/>
  <rect x="${card.x + 12}" y="${card.y}" width="${card.w - 24}" height="2.5" fill="url(#tube)"/>

  <text x="${left}" y="${card.y + 66}" font-family="Helvetica, Arial, sans-serif" font-size="18" font-weight="700" letter-spacing="6" fill="#ffd60a">&amp; JULIET</text>
  <text x="${left - 3}" y="${card.y + 140}" font-family="Helvetica, Arial, sans-serif" font-size="66" font-weight="700" letter-spacing="-1" fill="#ffffff" filter="url(#bigGlow)">THE RELEASE TIMELINE</text>
  <text x="${left}" y="${card.y + 178}" font-family="Helvetica, Arial, sans-serif" font-size="21" fill="#c6aed8">${sub}</text>

  <line x1="${left}" x2="${right}" y1="${card.y + 212}" y2="${card.y + 212}" stroke="#ffffff" stroke-opacity="0.16"/>
${list}

  <rect x="0" y="${H - 16}" width="${W}" height="16" fill="#f23a95"/>
  <text x="${card.x}" y="${card.y + card.h + 32}" font-family="Helvetica, Arial, sans-serif" font-size="20" fill="#8d7ba3">drewhoover.com/and-juliet</text>
</svg>`
}

const variants = [
  {
    file: 'og.png',
    W: 1200,
    H: 630,
    cardH: 526,
    rows: OG_ROWS.map((i) => ROWS[i]),
    row0: 300,
    step: 41,
    sub: '29 pop hits behind &amp; Juliet, in the order they came out.',
  },
  {
    file: 'card.png',
    W: 1200,
    H: 750,
    cardH: 634,
    rows: ROWS,
    row0: 306,
    step: 38,
    sub: '29 pop hits behind &amp; Juliet, in the order they came out.',
  },
]

for (const v of variants) {
  await sharp(Buffer.from(svg(v))).png({ compressionLevel: 9 }).toFile(resolve(outDir, v.file))
  console.log(`${v.file} written (${v.W}×${v.H}, ${v.rows.length} rows)`)
}
