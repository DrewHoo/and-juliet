import { useMemo } from 'react'
import { WORDMARKS } from './data/wordmarks.js'
import { fmtDate } from './format.js'

// How big was it *then*: the better of the US Hot 100 and UK Singles peak.
// Taking the best of the two isn't just flattery — under Billboard's pre-2003
// commercial-single rule, airplay-only releases couldn't enter the Hot 100 at
// all, which is why "As Long as You Love Me" and "I'm Not a Girl, Not Yet a
// Woman" look like flops in US-only data. The UK chart caught both.
export function peakOf(song) {
  const cands = []
  if (song.hot100) cands.push([song.hot100, 'US'])
  if (song.ukPeak) cands.push([song.ukPeak, 'UK'])
  cands.sort((a, b) => a[0] - b[0])
  if (!cands.length) return { kind: 'none', badge: 'for the show' }
  const [best, where] = cands[0]
  if (best !== 1) return { kind: 'hit', badge: `${where} #${best}` }
  const both = cands.length === 2 && cands[1][0] === 1
  return { kind: 'one', badge: both ? '★ #1 US + UK' : `★ #1 ${where}` }
}

// Wordmark scaled to sit on the same line as the song title. Squat marks get
// taller so they don't vanish, very wide ones get capped, and each mark's own
// `scale` rides along so the whitespace-heavy ones aren't shrunk into nothing.
// Anything still too small to read as a name falls back to type.
function inlineMark(credit) {
  const m = WORDMARKS[credit]
  if (!m) return null
  const s = m.scale ?? 1
  let h = 13 * s
  let w = m.w * (h / m.h)
  if (w < 44) {
    h = Math.min(19 * s, h * (44 / w))
    w = m.w * (h / m.h)
  } else if (m.w / m.h >= 4.5) {
    h = 15 * s
    w = m.w * (h / m.h)
  }
  return w >= 38 ? { src: m.src, w: Math.round(w), h: Math.round(h) } : null
}

export default function ReleaseTimeline({ songs, selected, onSelect }) {
  const rows = useMemo(() => {
    let prevYear = null
    return [...songs]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((song) => {
        const year = Number(song.date.slice(0, 4))
        const peak = peakOf(song)
        const credit = song.lane || song.artist
        const peaks = [
          song.hot100 ? `US #${song.hot100}` : null,
          song.ukPeak ? `UK #${song.ukPeak}` : null,
        ].filter(Boolean)
        const row = {
          song,
          credit,
          badge: peak.badge,
          kind: peak.kind,
          dot: song.original ? 'show' : peak.kind === 'one' ? 'one' : 'hit',
          year: year === prevYear ? '' : String(year),
          gap: prevYear !== null && year - prevYear > 1,
          mark: inlineMark(credit),
          tip: [
            song.title,
            song.original ? 'written for the show' : song.artist,
            fmtDate(song.date),
            ...peaks,
          ].join(' · '),
        }
        prevYear = year
        return row
      })
  }, [songs])

  return (
    <div className="marquee">
      {/* One h1 covering both lines, so the page's only heading reads
          "& Juliet — The Release Timeline" rather than a title that never
          names the show. Renders identically; the eyebrow is just a block
          span now. data-text feeds the ::before halo layer, which glows and
          buzzes while the real text above it stays crisp. */}
      <h1 className="m-head">
        <span className="m-eyebrow">&amp; Juliet</span>
        <span className="m-title" data-text="The Release Timeline">
          The Release Timeline
        </span>
      </h1>
      <p className="m-sub">
        If you don't know, & Juliet is a brilliant broadway musical that retells the story of
        Romeo & Juliet, that begins when Juliet would have killed herself in the original story.
        Instead she goes on a journey of self-discovery, aided by the pop-iest pop songs from the 
        late 90s and early aughts. It's utterly delightful. It made me feel big feelings and helped
        me reinterpret my generation's pop songs' cultural relevance in a new, better light.
        <br/>
        It's also the story of Anne Hathaway (Bill Shakespeare's spouse)
        renegotiating her agency and voice via co-rewriting--sometimes contentiously--Shakespeare's famous tragedy.
        Romeo and Juliet become Anne and Bill's stand-ins so the whole thing is very layered and thoughtful on multiple levels.

        Anyway--if you had a hard time remembering when these songs came out, here they
        are on a beautiful timeline… <em>because I want it that way</em>
      </p>

      <div className="m-legend">
        <span className="m-key"><i className="m-dot hit" />charted hit</span>
        <span className="m-key"><i className="m-dot one" />#1 in the US or UK</span>
        <span className="m-key"><i className="m-dot show" />written for the show</span>
      </div>

      <ol className="m-rows">
        {rows.map((r) => (
          <li key={r.song.id} className={r.gap ? 'm-jump' : undefined}>
            <button
              type="button"
              className={`m-row${selected === r.song.id ? ' is-selected' : ''}`}
              title={r.tip}
              onClick={() => onSelect(selected === r.song.id ? null : r.song.id)}
            >
              <span className="m-year">{r.year}</span>
              <span className="m-spine">
                <i className={`m-dot ${r.dot}`} />
              </span>
              <span className="m-song">
                <span className="m-name">{r.song.title}</span>
                {r.mark ? (
                  <img
                    className="m-mark"
                    src={`${import.meta.env.BASE_URL}artists/${r.mark.src}`}
                    alt={r.credit}
                    width={r.mark.w}
                    height={r.mark.h}
                    loading="lazy"
                  />
                ) : (
                  <span className="m-artist">{r.credit}</span>
                )}
              </span>
              <span className={`m-badge is-${r.kind}`}>{r.badge}</span>
            </button>
          </li>
        ))}
      </ol>

      <p className="m-foot">
        peak = the better of the Billboard Hot 100 and UK Singles chart at
        release &middot; &ldquo;One More Try&rdquo; was written for the show;
        Jessie&nbsp;J released its single
      </p>
    </div>
  )
}
