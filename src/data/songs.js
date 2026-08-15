// The original recordings behind & Juliet's musical numbers.
// Song list: & Juliet Original Broadway Cast Recording (2022), cross-checked
// against the West End production (song lists are identical; London's album
// merges Domino/Show Me Love into a medley). Reprises are not repeated.
// hot100 = Billboard Hot 100 peak (null = never entered), ukPeak = UK Singles
// peak, streamsM = approx Spotify streams of the original recording in
// millions (kworb.net, Aug 2026; Adam Lambert figure is an estimate).
export const SONGS = [
  { id: 'larger-than-life', number: 'Larger Than Life', title: 'Larger Than Life', artist: 'Backstreet Boys', date: '1999-09-07', album: 'Millennium', hot100: 25, ukPeak: 5, streamsM: 310 },
  { id: 'i-want-it-that-way', number: 'I Want It That Way', title: 'I Want It That Way', artist: 'Backstreet Boys', date: '1999-04-12', album: 'Millennium', hot100: 6, ukPeak: 1, streamsM: 2146 },
  { id: 'baby-one-more-time', number: '…Baby One More Time', title: '…Baby One More Time', artist: 'Britney Spears', date: '1998-09-29', album: '…Baby One More Time', hot100: 1, ukPeak: 1, streamsM: 1429 },
  { id: 'show-me-the-meaning', number: 'Show Me the Meaning of Being Lonely', title: 'Show Me the Meaning of Being Lonely', artist: 'Backstreet Boys', date: '1999-12-14', album: 'Millennium', hot100: 6, ukPeak: 3, streamsM: 312 },
  { id: 'domino', number: 'Domino', title: 'Domino', artist: 'Jessie J', date: '2011-08-29', album: 'Who You Are', hot100: 6, ukPeak: 1, streamsM: 844 },
  { id: 'show-me-love', number: 'Show Me Love', title: 'Show Me Love', artist: 'Robyn', date: '1997-02-24', album: 'Robyn Is Here', hot100: 7, ukPeak: 8, streamsM: 81 },
  { id: 'blow', number: 'Blow', title: 'Blow', artist: 'Kesha', date: '2011-02-08', album: 'Cannibal', hot100: 7, ukPeak: 32, streamsM: 418 },
  { id: 'not-a-girl', number: "I'm Not a Girl, Not Yet a Woman", title: "I'm Not a Girl, Not Yet a Woman", artist: 'Britney Spears', date: '2002-01-07', album: 'Britney', hot100: null, ukPeak: 2, streamsM: 87 },
  { id: 'overprotected', number: 'Overprotected', title: 'Overprotected', artist: 'Britney Spears', date: '2001-12-10', album: 'Britney', hot100: 86, ukPeak: 4, streamsM: 123 },
  { id: 'confident', number: 'Confident', title: 'Confident', artist: 'Demi Lovato', date: '2015-09-18', album: 'Confident', hot100: 21, ukPeak: 65, streamsM: 708 },
  { id: 'teenage-dream', number: 'Teenage Dream / Break Free', title: 'Teenage Dream', artist: 'Katy Perry', date: '2010-07-23', album: 'Teenage Dream', hot100: 1, ukPeak: 2, streamsM: 1233 },
  { id: 'break-free', number: 'Teenage Dream / Break Free', title: 'Break Free', artist: 'Ariana Grande', date: '2014-07-02', album: 'My Everything', hot100: 4, ukPeak: 16, streamsM: 1291 },
  { id: 'oops-i-did-it-again', number: 'Oops!… I Did It Again', title: 'Oops!… I Did It Again', artist: 'Britney Spears', date: '2000-03-27', album: 'Oops!… I Did It Again', hot100: 9, ukPeak: 1, streamsM: 1250 },
  { id: 'i-kissed-a-girl', number: 'I Kissed a Girl', title: 'I Kissed a Girl', artist: 'Katy Perry', date: '2008-04-28', album: 'One of the Boys', hot100: 1, ukPeak: 1, streamsM: 1321 },
  { id: 'its-my-life', number: "It's My Life", title: "It's My Life", artist: 'Bon Jovi', date: '2000-05-23', album: 'Crush', hot100: 33, ukPeak: 3, streamsM: 1318 },
  { id: 'love-me-like-you-do', number: 'Love Me Like You Do', title: 'Love Me Like You Do', artist: 'Ellie Goulding', date: '2015-01-07', album: 'Fifty Shades of Grey (OST)', hot100: 3, ukPeak: 1, streamsM: 1868 },
  { id: 'since-u-been-gone', number: 'Since U Been Gone', title: 'Since U Been Gone', artist: 'Kelly Clarkson', date: '2004-11-16', album: 'Breakaway', hot100: 2, ukPeak: 5, streamsM: 1149 },
  // Filed under P!nk: she co-wrote it and recorded it first; Adam Lambert's
  // single was the original release (date and streams shown are his).
  { id: 'whataya-want-from-me', number: 'Whataya Want from Me', title: 'Whataya Want from Me', artist: 'P!nk', date: '2009-11-10', album: 'For Your Entertainment', hot100: 10, ukPeak: 53, streamsM: 250 },
  // The show's one original; Jessie J released the standalone single, so it
  // hangs on her lane in the chart.
  { id: 'one-more-try', number: 'One More Try', title: 'One More Try', artist: 'Written for the show', lane: 'Jessie J', date: '2019-11-22', album: '& Juliet (Original London Cast Recording)', hot100: null, ukPeak: null, streamsM: null, original: true },
  { id: 'problem', number: "Problem / Can't Feel My Face", title: 'Problem', artist: 'Ariana Grande', date: '2014-04-28', album: 'My Everything', hot100: 2, ukPeak: 1, streamsM: 1168 },
  { id: 'cant-feel-my-face', number: "Problem / Can't Feel My Face", title: "Can't Feel My Face", artist: 'The Weeknd', date: '2015-06-08', album: 'Beauty Behind the Madness', hot100: 1, ukPeak: 3, streamsM: 2237 },
  { id: 'thats-the-way-it-is', number: "That's the Way It Is", title: "That's the Way It Is", artist: 'Céline Dion', date: '1999-11-01', album: 'All the Way… A Decade of Song', hot100: 6, ukPeak: 12, streamsM: 240 },
  { id: 'everybody', number: "Everybody (Backstreet's Back)", title: "Everybody (Backstreet's Back)", artist: 'Backstreet Boys', date: '1997-07-14', album: "Backstreet's Back", hot100: 4, ukPeak: 3, streamsM: 867 },
  { id: 'as-long-as-you-love-me', number: 'As Long as You Love Me', title: 'As Long as You Love Me', artist: 'Backstreet Boys', date: '1997-09-29', album: "Backstreet's Back", hot100: null, ukPeak: 3, streamsM: 806 },
  { id: 'its-gonna-be-me', number: "It's Gonna Be Me", title: "It's Gonna Be Me", artist: '*NSYNC', date: '2000-06-13', album: 'No Strings Attached', hot100: 1, ukPeak: 9, streamsM: 437 },
  { id: 'shape-of-my-heart', number: 'Shape of My Heart', title: 'Shape of My Heart', artist: 'Backstreet Boys', date: '2000-10-02', album: 'Black & Blue', hot100: 9, ukPeak: 4, streamsM: 622 },
  { id: 'stronger', number: 'Stronger', title: 'Stronger', artist: 'Britney Spears', date: '2000-10-31', album: 'Oops!… I Did It Again', hot100: 11, ukPeak: 7, streamsM: 213 },
  { id: 'fkin-perfect', number: "F**kin' Perfect", title: "F**kin' Perfect", artist: 'P!nk', date: '2010-12-14', album: 'Greatest Hits… So Far!!!', hot100: 2, ukPeak: 10, streamsM: 464 },
  { id: 'roar', number: 'Roar', title: 'Roar', artist: 'Katy Perry', date: '2013-08-10', album: 'Prism', hot100: 1, ukPeak: 1, streamsM: 1597 },
  { id: 'cant-stop-the-feeling', number: "Can't Stop the Feeling!", title: "Can't Stop the Feeling!", artist: 'Justin Timberlake', date: '2016-05-06', album: 'Trolls (OST)', hot100: 1, ukPeak: 2, streamsM: 2098 },
]
