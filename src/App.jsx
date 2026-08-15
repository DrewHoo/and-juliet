import { useEffect, useState } from 'react'
import ReleaseTimeline from './ReleaseTimeline.jsx'
import { SONGS } from './data/songs.js'

function songFromUrl() {
  const id = new URLSearchParams(window.location.search).get('song')
  return SONGS.some((s) => s.id === id) ? id : null
}

export default function App() {
  // Starts null rather than reading the URL, because this tree is prerendered
  // at build time (scripts/prerender.mjs) and there is no location to read on
  // the server — seeding from the URL here would hydrate into a mismatch.
  // The effect applies ?song= immediately after mount instead.
  const [selected, setSelected] = useState(null)
  useEffect(() => setSelected(songFromUrl()), [])

  // No share button — the view is static enough not to need one. Clicking a
  // row still marks your place and still writes ?song= to the URL, so any
  // links already out there keep resolving.
  function select(id) {
    setSelected(id)
    const url = new URL(window.location)
    if (id) url.searchParams.set('song', id)
    else url.searchParams.delete('song')
    window.history.replaceState(null, '', url)
    // The replaceState above already generates a pageview via the shared
    // analytics embed; this names the song so "which ones do people click"
    // is one query rather than a pathname parse. Optional-chained because the
    // embed is third-party and may be blocked.
    if (id) {
      const song = SONGS.find((s) => s.id === id)
      window.dhAnalytics?.track('Song selected', {
        id,
        title: song?.title,
        artist: song?.artist,
        year: Number(song?.date.slice(0, 4)),
      })
    }
  }

  return (
    <main>
      <ReleaseTimeline songs={SONGS} selected={selected} onSelect={select} />

      <p className="sources">
        Song list from the &amp; Juliet Broadway cast recording, cross-checked
        against the West End production. Release dates and chart peaks from
        Billboard, the Official Charts Company and Wikipedia. Peak is the better
        of a song&rsquo;s US Hot 100 and UK Singles position, because
        Billboard&rsquo;s pre-2003 rules kept airplay-only singles off the Hot
        100 entirely — the only reason &ldquo;As Long as You Love Me&rdquo; and
        &ldquo;I&rsquo;m Not a Girl, Not Yet a Woman&rdquo; carry no US number.
        Two judgment calls: &ldquo;Whataya Want from Me&rdquo; is filed under
        P!nk, who co-wrote it and recorded it first — Adam Lambert&rsquo;s
        single was the original release, and the date and peaks shown are his.
        And &ldquo;One More Try&rdquo; hangs on Jessie&nbsp;J, who released its
        single.
      </p>
    </main>
  )
}
