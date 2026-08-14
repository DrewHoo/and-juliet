// Artist wordmark images (public/artists/*), rendered as near-white
// silhouettes on the desktop lane labels. All sourced from Wikimedia Commons
// (mostly PD-textlogo; see README). Robyn and The Weeknd only have
// signature-scribble marks that don't read as names, so they stay text.
// w/h describe the layout box; preserveAspectRatio fits the mark inside it.
export const WORDMARKS = {
  'Backstreet Boys': { src: 'backstreet-boys.png', w: 118, h: 20 },
  'Britney Spears': { src: 'britney-spears.png', w: 104, h: 27 },
  'Katy Perry': { src: 'katy-perry.svg', w: 96, h: 28 },
  'Ariana Grande': { src: 'ariana-grande.svg', w: 112, h: 26 },
  'Jessie J': { src: 'jessie-j.png', w: 64, h: 26 },
  'P!nk': { src: 'pink.png', w: 56, h: 26 },
  'Justin Timberlake': { src: 'justin-timberlake.png', w: 140, h: 12 },
  'Ellie Goulding': { src: 'ellie-goulding.svg', w: 130, h: 17 },
  'Bon Jovi': { src: 'bon-jovi.svg', w: 108, h: 22 },
  'Kelly Clarkson': { src: 'kelly-clarkson.png', w: 124, h: 13 },
  'Demi Lovato': { src: 'demi-lovato.svg', w: 100, h: 20 },
  '*NSYNC': { src: 'nsync.svg', w: 108, h: 23 },
  'Kesha': { src: 'kesha.png', w: 66, h: 26 },
  'Céline Dion': { src: 'celine-dion.png', w: 60, h: 34 },
}
