import { useMemo, useState } from 'react'
import Timeline, { fmtStreams } from './Timeline.jsx'
import SongTable from './SongTable.jsx'
import { SONGS } from './data/songs.js'

function songFromUrl() {
  const id = new URLSearchParams(window.location.search).get('song')
  return SONGS.some((s) => s.id === id) ? id : null
}

export default function App() {
  const [selected, setSelected] = useState(songFromUrl)
  const [copied, setCopied] = useState(false)

  function select(id) {
    setSelected(id)
    const url = new URL(window.location)
    if (id) url.searchParams.set('song', id)
    else url.searchParams.delete('song')
    window.history.replaceState(null, '', url)
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard unavailable — the URL bar still has the state */
    }
  }

  const stats = useMemo(() => {
    const covers = SONGS.filter((s) => !s.original)
    const artists = new Set(covers.map((s) => s.artist))
    const years = covers.map((s) => Number(s.date.slice(0, 4)))
    const totalStreams = SONGS.reduce((t, s) => t + (s.streamsM || 0), 0)
    return {
      covers: covers.length,
      artists: artists.size,
      span: `${Math.min(...years)}–${Math.max(...years)}`,
      streams: fmtStreams(totalStreams),
    }
  }, [])

  return (
    <main>
      <header className="hero">
        <span className="amp" aria-hidden="true">&amp;</span>
        <h1>
          Who wrote <span className="hl">&amp; Juliet</span>?
        </h1>
        <p className="lede">
          The premise: Juliet skips the dagger. The soundtrack: every number
          but one is a pop hit you already know — and all of them, from
          &ldquo;I Want It That Way&rdquo; to &ldquo;Can&rsquo;t Feel My
          Face,&rdquo; share one co-writer, Max Martin. Below are the original
          recordings, laid out by who sang them, when they came out, and how
          hard people still stream them.
        </p>
      </header>

      <div className="tiles">
        <div className="tile">
          <div className="label">Pop hits covered</div>
          <div className="value">{stats.covers}</div>
        </div>
        <div className="tile">
          <div className="label">Original artists</div>
          <div className="value">{stats.artists}</div>
        </div>
        <div className="tile">
          <div className="label">Release span</div>
          <div className="value">{stats.span}</div>
        </div>
        <div className="tile">
          <div className="label">Combined streams</div>
          <div className="value">{stats.streams}</div>
        </div>
      </div>

      <section>
        <h2>Who brought the hits?</h2>
        <p className="sub">
          One row per artist, sorted by how many songs they contribute —
          Backstreet Boys on top with six. Each bubble sits at the
          original&rsquo;s release date and is sized by its Spotify streams
          today; the violet one is &ldquo;One More Try,&rdquo; the only song
          written for the show. Tap any bubble for details.
        </p>
        <div className="card">
          <Timeline songs={SONGS} selected={selected} onSelect={select} />
        </div>
        <div className="share-row">
          <button className="share-btn" onClick={share}>
            {copied ? 'Copied ✓' : 'Share this view'}
          </button>
          {selected && (
            <span className="share-note">Link includes your selected song.</span>
          )}
        </div>
      </section>

      <section>
        <h2>All 30, on the record</h2>
        <p className="sub">
          Every song in the show, with its original artist, release date,
          chart peak, and streams.
        </p>
        <div className="card">
          <SongTable songs={SONGS} selected={selected} onSelect={select} />
        </div>
      </section>

      <section>
        <p className="sources">
          Song list from the Broadway cast recording. Release dates and chart
          peaks from Billboard and Wikipedia. Stream counts are approximate,
          from kworb.net as of August 2026 — and they measure popularity now,
          not then: older songs have had decades to pile up plays, newer ones
          grew up on streaming, so bubble size is a rough proxy, not a
          scoreboard.
        </p>
      </section>
    </main>
  )
}
