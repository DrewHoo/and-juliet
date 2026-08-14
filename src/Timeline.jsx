import { useEffect, useMemo, useRef, useState } from 'react'

const EVERYONE_ELSE = '…& everyone else'
const PREMIERE = Date.UTC(2019, 10, 20) // West End opening night, 20 Nov 2019

function ts(iso) {
  return Date.parse(`${iso}T00:00:00Z`)
}

export function fmtDate(iso) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  })
}

export function fmtStreams(m) {
  if (m == null) return '—'
  if (m >= 1000) return `${(m / 1000).toFixed(1)}B`
  return `${Math.round(m)}M`
}

// Group songs into swimlanes: artists with 2+ songs get their own lane
// (sorted most-influential first), everyone else shares the bottom lane.
export function buildLanes(songs) {
  const byArtist = new Map()
  for (const s of songs) {
    if (!byArtist.has(s.artist)) byArtist.set(s.artist, [])
    byArtist.get(s.artist).push(s)
  }
  const majors = [...byArtist.entries()]
    .filter(([, list]) => list.length >= 2)
    .sort((a, b) => {
      if (b[1].length !== a[1].length) return b[1].length - a[1].length
      const streams = (list) => list.reduce((t, s) => t + (s.streamsM || 0), 0)
      return streams(b[1]) - streams(a[1])
    })
  const rest = songs.filter((s) => byArtist.get(s.artist).length < 2)
  const lanes = majors.map(([artist, list]) => ({ artist, songs: list }))
  if (rest.length) lanes.push({ artist: EVERYONE_ELSE, songs: rest })
  return lanes
}

export default function Timeline({ songs, selected, onSelect }) {
  const wrapRef = useRef(null)
  const [width, setWidth] = useState(() =>
    Math.max(Math.min(1004, window.innerWidth - 76), 240),
  )
  const [hovered, setHovered] = useState(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const narrow = width < 640
  const margin = {
    top: 8,
    right: narrow ? 10 : 24,
    bottom: 26,
    left: narrow ? 10 : 168,
  }

  const layout = useMemo(() => {
    const lanes = buildLanes(songs)
    const dates = songs.map((s) => ts(s.date))
    const x0 = Math.min(...dates)
    const domainStart = Date.UTC(new Date(x0).getUTCFullYear() - 1, 0, 1)
    const domainEnd = Date.UTC(2020, 3, 1) // room for the premiere marker
    const innerW = Math.max(width - margin.left - margin.right, 200)
    const x = (t) => margin.left + ((t - domainStart) / (domainEnd - domainStart)) * innerW

    const maxStreams = Math.max(...songs.map((s) => s.streamsM || 0))
    const maxR = narrow ? 17 : 24
    const r = (m) => (m == null ? 5.5 : 4 + Math.sqrt(m / maxStreams) * (maxR - 4))

    // Per-lane collision relief: nudge overlapping bubbles up/down a step.
    const laneHeader = narrow ? 20 : 0
    let y = margin.top
    const placed = []
    const laneBands = []
    for (const lane of lanes) {
      const rows = lane.songs
        .map((s) => ({ song: s, cx: x(ts(s.date)), r: r(s.streamsM), dy: 0 }))
        .sort((a, b) => a.cx - b.cx)
      const step = 9
      for (let i = 0; i < rows.length; i++) {
        const offsets = [0, -1, 1, -2, 2, -3, 3]
        for (const o of offsets) {
          rows[i].dy = o * step
          const collides = rows
            .slice(0, i)
            .some(
              (p) =>
                Math.hypot(p.cx - rows[i].cx, p.dy - rows[i].dy) <
                p.r + rows[i].r + 3,
            )
          if (!collides) break
        }
      }
      const spread = Math.max(...rows.map((d) => Math.abs(d.dy) + d.r), 14)
      const laneH = laneHeader + spread * 2 + 14
      const cy = y + laneHeader + (laneH - laneHeader) / 2
      for (const d of rows) placed.push({ ...d, cy: cy + d.dy, lane: lane.artist })
      laneBands.push({ lane, top: y, height: laneH, cy })
      y += laneH
    }

    const height = y + margin.bottom
    const years = []
    for (let yr = new Date(domainStart).getUTCFullYear(); yr <= 2020; yr++) {
      if (yr % 5 === 0) years.push(yr)
    }
    return { placed, laneBands, height, x, years, domainStart, domainEnd }
  }, [songs, width, narrow, margin.left, margin.right, margin.top])

  const { placed, laneBands, height, x, years } = layout

  // Direct-label only the headliners; everything else lives in tooltip + table.
  // Labels that would collide flip below the bubble, and drop entirely if
  // still overlapping an already-placed label.
  const labels = useMemo(() => {
    // Top song per lane keeps labels spread across the chart instead of
    // piling up in the streaming-era cluster; the show original always gets one.
    const byLane = new Map()
    for (const d of placed) {
      const cur = byLane.get(d.lane)
      if (!cur || (d.song.streamsM || 0) > (cur.streamsM || 0)) {
        byLane.set(d.lane, d.song)
      }
    }
    const top = [
      ...[...byLane.values()].sort((a, b) => (b.streamsM || 0) - (a.streamsM || 0)),
      ...songs.filter((s) => s.original),
    ].slice(0, narrow ? 4 : 8)
    const out = []
    const w = (t) => t.length * 5.6 + 8
    const hitsCircle = (box, c) => {
      const nx = Math.max(box.x, Math.min(c.cx, box.x + box.w))
      const ny = Math.max(box.y, Math.min(c.cy, box.y + box.h))
      return Math.hypot(c.cx - nx, c.cy - ny) < c.r + 2
    }
    for (const s of top) {
      const d = placed.find((p) => p.song.id === s.id)
      if (!d) continue
      const bw = w(s.title)
      const candidates = [
        { pos: 'above', x: d.cx - bw / 2, y: d.cy - d.r - 17 },
        { pos: 'below', x: d.cx - bw / 2, y: d.cy + d.r + 4 },
        { pos: 'right', x: d.cx + d.r + 6, y: d.cy - 6.5 },
        { pos: 'left', x: d.cx - d.r - 6 - bw, y: d.cy - 6.5 },
      ]
      for (const c of candidates) {
        const box = { x: c.x, y: c.y, w: bw, h: 13 }
        if (box.x < 2 || box.x + box.w > width - 2) continue
        const collides =
          out.some(
            (o) =>
              box.x < o.box.x + o.box.w &&
              o.box.x < box.x + box.w &&
              box.y < o.box.y + o.box.h &&
              o.box.y < box.y + box.h,
          ) || placed.some((p) => p !== d && hitsCircle(box, p))
        if (!collides) {
          out.push({ d, pos: c.pos, box })
          break
        }
      }
    }
    return out
  }, [songs, narrow, placed, width])

  const active = hovered ?? placed.find((d) => d.song.id === selected) ?? null

  function tooltipPos(d) {
    const w = 218
    let left = d.cx - w / 2
    left = Math.max(4, Math.min(left, width - w - 4))
    const above = d.cy > 130
    return {
      left,
      top: above ? undefined : d.cy + d.r + 12,
      bottom: above ? height - d.cy + d.r + 12 : undefined,
    }
  }

  return (
    <div className="chart-wrap" ref={wrapRef}>
      <div className="legend">
        <span className="key"><i className="dot pink" /> Pop original</span>
        <span className="key"><i className="dot violet" /> Written for the show</span>
        <span className="key size-key">
          <i className="dot pink sm" /> fewer streams
          <i className="dot pink lg" /> more streams
        </span>
      </div>
      <svg width={width} height={height} role="img" aria-label="Timeline of the original recordings behind & Juliet, one row per artist, bubbles sized by Spotify streams. Full data in the table below.">
        {/* year gridlines */}
        {years.map((yr) => {
          const gx = x(Date.UTC(yr, 0, 1))
          return (
            <g key={yr}>
              <line x1={gx} x2={gx} y1={margin.top} y2={height - margin.bottom + 4} stroke="var(--grid)" strokeWidth="1" />
              <text x={gx} y={height - 8} textAnchor="middle" fontSize="11" fill="var(--text-muted)">
                {yr}
              </text>
            </g>
          )
        })}

        {/* premiere marker */}
        <line x1={x(PREMIERE)} x2={x(PREMIERE)} y1={margin.top + 12} y2={height - margin.bottom + 4} stroke="var(--violet)" strokeWidth="1" />
        <text x={x(PREMIERE) - 6} y={margin.top + 22} textAnchor="end" fontSize="11" fill="var(--violet)">
          &amp; Juliet opens{narrow ? '' : ' · Nov 2019'}
        </text>

        {/* lane separators + labels */}
        {laneBands.map(({ lane, top, height: lh, cy }, i) => (
          <g key={lane.artist}>
            {i > 0 && (
              <line x1={narrow ? 0 : 8} x2={width - 4} y1={top} y2={top} stroke="var(--baseline)" strokeWidth="1" />
            )}
            {narrow ? (
              <text x={2} y={top + 14} fontSize="11.5" fontWeight="600" fill="var(--text-secondary)">
                {lane.artist}
                <tspan fill="var(--text-muted)" fontWeight="400">
                  {'  ·  '}{lane.songs.length} {lane.songs.length === 1 ? 'song' : 'songs'}
                </tspan>
              </text>
            ) : (
              <>
                <text x={margin.left - 14} y={cy - 2} textAnchor="end" fontSize="12.5" fontWeight="600" fill="var(--text-secondary)">
                  {lane.artist}
                </text>
                <text x={margin.left - 14} y={cy + 13} textAnchor="end" fontSize="11" fill="var(--text-muted)">
                  {lane.songs.length} {lane.songs.length === 1 ? 'song' : 'songs'} · {fmtStreams(lane.songs.reduce((t, s) => t + (s.streamsM || 0), 0))} streams
                </text>
              </>
            )}
          </g>
        ))}

        {/* bubbles — bigger ones first so small stay reachable */}
        {[...placed]
          .sort((a, b) => b.r - a.r)
          .map((d) => {
            const isActive = active?.song.id === d.song.id
            const isSelected = selected === d.song.id
            return (
              <g
                key={d.song.id}
                tabIndex={0}
                role="button"
                aria-label={`${d.song.title} — ${d.song.artist}, ${fmtDate(d.song.date)}`}
                style={{ cursor: 'pointer', outline: 'none' }}
                onPointerEnter={() => setHovered(d)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(d)}
                onBlur={() => setHovered(null)}
                onClick={() => onSelect(isSelected ? null : d.song.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(isSelected ? null : d.song.id)
                  }
                }}
              >
                {/* generous invisible hit target */}
                <circle cx={d.cx} cy={d.cy} r={Math.max(d.r + 6, 14)} fill="transparent" />
                {isSelected && (
                  <circle cx={d.cx} cy={d.cy} r={d.r + 4} fill="none" stroke="var(--violet)" strokeWidth="2" />
                )}
                <circle
                  cx={d.cx}
                  cy={d.cy}
                  r={d.r}
                  fill={d.song.original ? 'var(--violet)' : 'var(--pink)'}
                  fillOpacity={isActive ? 1 : 0.82}
                  stroke="var(--surface)"
                  strokeWidth="2"
                />
              </g>
            )
          })}

        {/* selective direct labels on the headliners */}
        {labels.map(({ d, pos, box }) => (
          <text
            key={`lbl-${d.song.id}`}
            x={pos === 'above' || pos === 'below' ? d.cx : pos === 'right' ? box.x : box.x + box.w}
            y={box.y + 10}
            textAnchor={pos === 'right' ? 'start' : pos === 'left' ? 'end' : 'middle'}
            fontSize="11"
            fill="var(--text-secondary)"
            style={{ pointerEvents: 'none' }}
          >
            {d.song.title}
          </text>
        ))}
      </svg>

      {active && (
        <div className="tooltip" style={tooltipPos(active)}>
          <div className="t-song">{active.song.title}</div>
          <div className="t-artist">{active.song.artist}</div>
          <div className="t-row"><span>Released</span> <strong>{fmtDate(active.song.date)}</strong></div>
          <div className="t-row"><span>Spotify streams</span> <strong>{fmtStreams(active.song.streamsM)}</strong></div>
          <div className="t-row"><span>Hot 100 peak</span> <strong>{active.song.hot100 ? `#${active.song.hot100}` : '—'}</strong></div>
          {active.song.number && active.song.number !== active.song.title && (
            <div className="t-row"><span>Show number</span> <strong>{active.song.number}</strong></div>
          )}
        </div>
      )}
    </div>
  )
}
