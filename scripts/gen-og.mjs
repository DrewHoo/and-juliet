import sharp from 'sharp'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const outDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public')

// Stylized mini version of the timeline: pink bubbles on artist lanes,
// one violet bubble at the show's opening. Not to scale — representative.
const lanes = [
  { y: 150, dots: [[705, 16], [742, 26], [790, 15], [730, 12]] },
  { y: 240, dots: [[695, 21], [762, 20], [820, 10], [845, 12]] },
  { y: 330, dots: [[890, 15], [935, 14], [990, 19]] },
  { y: 420, dots: [[985, 13], [1010, 17]] },
  { y: 510, dots: [[680, 10], [760, 15], [860, 12], [920, 14], [1000, 22], [1035, 24]] },
]
const bubbles = lanes
  .flatMap(({ y, dots }) =>
    dots.map(([x, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#f23a95" fill-opacity="0.88" stroke="#170f21" stroke-width="3"/>`),
  )
  .join('\n  ')
const laneLines = lanes
  .map(({ y }) => `<line x1="660" x2="1150" y1="${y + 45}" y2="${y + 45}" stroke="#261a35" stroke-width="1"/>`)
  .join('\n  ')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#160d22"/>
      <stop offset="1" stop-color="#0a0610"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#f23a95" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#f23a95" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="160" cy="180" r="230" fill="url(#glow)"/>

  <text x="60" y="270" font-family="Georgia, serif" font-style="italic" font-weight="700" font-size="230" fill="#f23a95">&amp;</text>
  <text x="62" y="360" font-family="Helvetica, Arial, sans-serif" font-style="italic" font-weight="900" font-size="64" fill="#ffffff">WHO WROTE</text>
  <text x="62" y="435" font-family="Helvetica, Arial, sans-serif" font-style="italic" font-weight="900" font-size="64" fill="#f23a95">&amp; JULIET<tspan fill="#ffffff">?</tspan></text>
  <text x="64" y="490" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="#cfc3e0">29 pop hits, 16 artists, one Max Martin.</text>

  ${laneLines}
  ${bubbles}
  <line x1="1105" x2="1105" y1="115" y2="560" stroke="#8a6cf0" stroke-width="2"/>
  <circle cx="1105" cy="510" r="8" fill="#8a6cf0" stroke="#170f21" stroke-width="3"/>

  <rect x="0" y="614" width="1200" height="16" fill="#f23a95"/>
  <text x="62" y="580" font-family="Helvetica, Arial, sans-serif" font-size="22" fill="#97889f">drewhoover.com/and-juliet</text>
</svg>`

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(resolve(outDir, 'og.png'))
console.log('og.png written')
