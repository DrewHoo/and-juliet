// Artist wordmark images (public/artists/*), rendered as near-white
// silhouettes on the desktop lane labels and inline in the release timeline.
// All sourced from Wikimedia Commons (mostly PD-textlogo; see README). Robyn
// and The Weeknd only have signature-scribble marks that don't read as names,
// so they stay text.
//
// w/h describe the layout box; the art is fitted inside it, so a box wider
// than the art's own ratio just leaves slack. `scale` is the one knob for
// "draw this one bigger": some marks waste most of their box on internal
// whitespace — Britney's and Ariana's have deep padding, Katy's and Demi's are
// short-x-height, and Céline's is a hairline script adrift in a near-square
// field — so those five are drawn larger to land at the same optical weight as
// Backstreet Boys' or Ellie Goulding's.
export const WORDMARKS = {
  'Backstreet Boys': { src: 'backstreet-boys.png', w: 118, h: 20 },
  'Britney Spears': { src: 'britney-spears.png', w: 104, h: 27, scale: 1.3 },
  'Katy Perry': { src: 'katy-perry.svg', w: 96, h: 28, scale: 1.22 },
  'Ariana Grande': { src: 'ariana-grande.svg', w: 112, h: 26, scale: 1.25 },
  'Jessie J': { src: 'jessie-j.png', w: 64, h: 26 },
  'P!nk': { src: 'pink.png', w: 56, h: 26 },
  'Justin Timberlake': { src: 'justin-timberlake.png', w: 140, h: 12 },
  'Ellie Goulding': { src: 'ellie-goulding.svg', w: 130, h: 17 },
  'Bon Jovi': { src: 'bon-jovi.svg', w: 108, h: 22 },
  'Kelly Clarkson': { src: 'kelly-clarkson.png', w: 124, h: 13 },
  'Demi Lovato': { src: 'demi-lovato.svg', w: 100, h: 20, scale: 1.32 },
  '*NSYNC': { src: 'nsync.svg', w: 108, h: 23 },
  'Kesha': { src: 'kesha.png', w: 66, h: 26 },
  'Céline Dion': { src: 'celine-dion.png', w: 60, h: 34, scale: 1.27 },
}

// The drawn box for an artist's mark, `scale` already applied.
export function markBox(artist) {
  const m = WORDMARKS[artist]
  if (!m) return null
  const s = m.scale ?? 1
  return { src: m.src, w: m.w * s, h: m.h * s }
}
