import { useEffect, useMemo, useRef, useState } from 'react'
import { WORDMARKS } from './data/wordmarks.js'

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

// One swimlane per artist, most influential first (song count, then total
// streams). A song can point its lane elsewhere via `lane` (e.g. "One More
// Try" hangs on Jessie J, who released its single).
export function buildLanes(songs) {
  const byArtist = new Map()
  for (const s of songs) {
    const key = s.lane || s.artist
    if (!byArtist.has(key)) byArtist.set(key, [])
    byArtist.get(key).push(s)
  }
  const total = (list) => list.reduce((t, s) => t + (s.streamsM || 0), 0)
  return [...byArtist.entries()]
    .sort((a, b) => b[1].length - a[1].length || total(b[1]) - total(a[1]))
    .map(([artist, list]) => ({ artist, songs: list }))
}

function boxesOverlap(a, b) {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
}

function boxHitsCircle(box, c) {
  const nx = Math.max(box.x, Math.min(c.cx, box.x + box.w))
  const ny = Math.max(box.y, Math.min(c.cy, box.y + box.h))
  return Math.hypot(c.cx - nx, c.cy - ny) < c.r + 2
}

const textW = (t, size = 11) => t.length * size * 0.51 + 8

// Greedy label placement: try spots around the bubble, skip the label
// entirely if every spot collides with another label or a bubble. A
// candidate may carry a `sub` second line (rendered smaller).
function placeLabels(
  candidates,
  placed,
  width,
  { size = 11, sideFirst = false, minX = 2, occupied = [] } = {},
) {
  const out = occupied.map((box) => ({ box }))
  for (const { d, text, sub } of candidates) {
    // Two-line label first; if nothing fits, retry with the first line alone.
    const variants = sub ? [{ text, sub }, { text }] : [{ text }]
    let done = false
    for (const v of variants) {
      const bw = Math.max(textW(v.text, size), v.sub ? textW(v.sub, size - 1) : 0)
      const bh = v.sub ? 26 : 13
      const co = d.r * 0.71 + 4 // corner offset from center
      const spots = [
        { pos: 'right', x: d.cx + d.r + 6, y: d.cy - bh / 2 },
        { pos: 'left', x: d.cx - d.r - 6 - bw, y: d.cy - bh / 2 },
        { pos: 'above', x: d.cx - bw / 2, y: d.cy - d.r - bh - 4 },
        { pos: 'below', x: d.cx - bw / 2, y: d.cy + d.r + 4 },
        // diagonal corners rescue labels in dense clusters (leader-lined)
        { pos: 'right', x: d.cx + co, y: d.cy + co, corner: true },
        { pos: 'left', x: d.cx - co - bw, y: d.cy + co, corner: true },
        { pos: 'right', x: d.cx + co, y: d.cy - co - bh, corner: true },
        { pos: 'left', x: d.cx - co - bw, y: d.cy - co - bh, corner: true },
      ]
      if (sideFirst && d.side === -1) spots.push(spots.shift()) // outer side first
      if (!sideFirst) spots.push(spots.shift(), spots.shift()) // above/below first
      for (const c of spots) {
        const box = { x: c.x, y: c.y, w: bw, h: bh }
        if (box.x < minX || box.x + box.w > width - 2 || box.y < 2) continue
        const collides =
          out.some((o) => boxesOverlap(box, o.box)) ||
          placed.some((p) => p !== d && boxHitsCircle(box, p))
        if (!collides) {
          out.push({ d, text: v.text, sub: v.sub, pos: c.pos, corner: c.corner, box })
          done = true
          break
        }
      }
      if (done) break
    }
  }
  return out.filter((o) => o.d)
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

  const vertical = width < 560

  const layout = useMemo(() => {
    const lanes = buildLanes(songs)
    const dates = songs.map((s) => ts(s.date))
    const domainStart = Date.UTC(new Date(Math.min(...dates)).getUTCFullYear() - 1, 0, 1)
    const domainEnd = Date.UTC(2020, 3, 1)
    const maxStreams = Math.max(...songs.map((s) => s.streamsM || 0))

    if (vertical) {
      // Phone layout: time runs down the page, newest first, bubbles swarm
      // around a spine; artist ranking lives in the lane view and the table.
      const margin = { top: 34, bottom: 16, left: 44, right: 8 }
      const startYear = new Date(domainStart).getUTCFullYear()
      const years = 2020.25 - startYear
      const pxPerYear = 54 // roomy: every bubble should have space for a label
      const height = margin.top + years * pxPerYear + margin.bottom
      const y = (t) =>
        margin.top +
        ((domainEnd - t) / (domainEnd - domainStart)) * (height - margin.top - margin.bottom)
      const maxR = 17
      const r = (m) => (m == null ? 5.5 : 4 + Math.sqrt(m / maxStreams) * (maxR - 4))
      const spineX = margin.left + (width - margin.left - margin.right) * 0.38
      // Zigzag close-in-time bubbles to alternating sides of the spine so
      // clusters open label corridors on both flanks instead of stacking
      // into one column.
      const placed = []
      let prevSide = -1
      let prevCy = -Infinity
      let prevR = 0
      for (const s of [...songs].sort((a, b) => ts(b.date) - ts(a.date))) {
        const cy = y(ts(s.date))
        const rr = r(s.streamsM)
        const close = cy - prevCy < prevR + rr + 34
        const side = close ? -prevSide : 1
        const d = { song: s, lane: s.lane || s.artist, cy, r: rr, side, cx: spineX + side * 17 }
        const step = 10
        for (let i = 0; i < 24; i++) {
          const o = i === 0 ? 0 : (i % 2 ? 1 : -1) * Math.ceil(i / 2) * step
          d.cx = Math.max(
            margin.left + d.r + 2,
            Math.min(spineX + side * 17 + o, width - margin.right - d.r),
          )
          if (!placed.some((p) => Math.hypot(p.cx - d.cx, p.cy - d.cy) < p.r + d.r + 3)) break
        }
        placed.push(d)
        prevSide = side
        prevCy = cy
        prevR = rr
      }
      const yearTicks = []
      for (let yr = startYear; yr <= 2020; yr++) {
        if (yr % 5 === 0) yearTicks.push(yr)
      }
      return { vertical: true, placed, lanes, height, y, yearTicks, margin }
    }

    // Desktop layout: one horizontal lane per artist, timeline left to right.
    const margin = { top: 8, right: 24, bottom: 26, left: 168 }
    const innerW = Math.max(width - margin.left - margin.right, 200)
    const x = (t) => margin.left + ((t - domainStart) / (domainEnd - domainStart)) * innerW
    const maxR = 24
    const r = (m) => (m == null ? 5.5 : 4 + Math.sqrt(m / maxStreams) * (maxR - 4))

    let yCursor = margin.top
    const placed = []
    const laneBands = []
    for (const lane of lanes) {
      const rows = lane.songs
        .map((s) => ({ song: s, cx: x(ts(s.date)), r: r(s.streamsM), dy: 0 }))
        .sort((a, b) => a.cx - b.cx)
      const step = 9
      for (let i = 0; i < rows.length; i++) {
        for (const o of [0, -1, 1, -2, 2, -3, 3]) {
          rows[i].dy = o * step
          const collides = rows
            .slice(0, i)
            .some((p) => Math.hypot(p.cx - rows[i].cx, p.dy - rows[i].dy) < p.r + rows[i].r + 3)
          if (!collides) break
        }
      }
      const spread = Math.max(...rows.map((d) => Math.abs(d.dy) + d.r), 12)
      const laneH = spread * 2 + 12
      const cy = yCursor + laneH / 2
      for (const d of rows) placed.push({ ...d, cy: cy + d.dy, lane: lane.artist })
      laneBands.push({ lane, top: yCursor, height: laneH, cy })
      yCursor += laneH
    }
    const height = yCursor + margin.bottom
    const yearTicks = []
    for (let yr = new Date(domainStart).getUTCFullYear(); yr <= 2020; yr++) {
      if (yr % 5 === 0) yearTicks.push(yr)
    }
    return { vertical: false, placed, laneBands, lanes, height, x, yearTicks, margin }
  }, [songs, width, vertical])

  const { placed, height, margin } = layout

  const labels = useMemo(() => {
    const topOfLane = new Map()
    for (const d of placed) {
      const cur = topOfLane.get(d.lane)
      if (!cur || (d.song.streamsM || 0) > (cur.song.streamsM || 0)) topOfLane.set(d.lane, d)
    }
    const byStreams = (a, b) => (b.song.streamsM || 0) - (a.song.streamsM || 0)
    if (layout.vertical) {
      // Artist-led two-line label on every bubble that has room. Each
      // artist's biggest song goes first so every name lands at least once;
      // repetition is what makes the heavy contributors obvious.
      const tops = [...topOfLane.values()].sort(byStreams)
      const rest = placed.filter((d) => !tops.includes(d)).sort(byStreams)
      const candidates = [...tops, ...rest].map((d) => ({
        d,
        text: d.lane,
        sub: d.song.title,
      }))
      const annW = textW('& Juliet opens · Nov 2019', 11)
      return placeLabels(candidates, placed, width, {
        size: 10.5,
        sideFirst: true,
        occupied: [
          { x: width - 4 - annW, y: layout.y(PREMIERE) - 20, w: annW, h: 16 },
          // year tick labels in the left gutter
          ...layout.yearTicks.map((yr) => ({
            x: 0,
            y: layout.y(Date.UTC(yr, 0, 1)) - 10,
            w: layout.margin.left - 2,
            h: 15,
          })),
        ],
      })
    }
    // Lane view: song titles — the lane label already names the artist.
    const candidates = [
      ...[...topOfLane.values()].sort(byStreams).slice(0, 10),
      ...placed.filter((d) => d.song.original),
    ].map((d) => ({ d, text: d.song.title }))
    return placeLabels(candidates, placed, width)
  }, [layout.vertical, placed, width])

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
      <svg
        width={width}
        height={height}
        role="img"
        aria-label="Timeline of the original recordings behind & Juliet, grouped by artist, bubbles sized by Spotify streams. Full data in the table below."
      >
        {layout.vertical ? (
          <>
            {layout.yearTicks.map((yr) => {
              const gy = layout.y(Date.UTC(yr, 0, 1))
              return (
                <g key={yr}>
                  <line x1={margin.left - 4} x2={width - 2} y1={gy} y2={gy} stroke="var(--grid)" strokeWidth="1" />
                  <text x={margin.left - 8} y={gy + 4} textAnchor="end" fontSize="11" fill="var(--text-muted)">
                    {yr}
                  </text>
                </g>
              )
            })}
            <line x1={margin.left - 4} x2={width - 2} y1={layout.y(PREMIERE)} y2={layout.y(PREMIERE)} stroke="var(--violet)" strokeWidth="1" />
            <text x={width - 4} y={layout.y(PREMIERE) - 6} textAnchor="end" fontSize="11" fill="var(--violet)">
              &amp; Juliet opens · Nov 2019
            </text>
          </>
        ) : (
          <>
            {layout.yearTicks.map((yr) => {
              const gx = layout.x(Date.UTC(yr, 0, 1))
              return (
                <g key={yr}>
                  <line x1={gx} x2={gx} y1={margin.top} y2={height - margin.bottom + 4} stroke="var(--grid)" strokeWidth="1" />
                  <text x={gx} y={height - 8} textAnchor="middle" fontSize="11" fill="var(--text-muted)">
                    {yr}
                  </text>
                </g>
              )
            })}
            <line x1={layout.x(PREMIERE)} x2={layout.x(PREMIERE)} y1={margin.top + 12} y2={height - margin.bottom + 4} stroke="var(--violet)" strokeWidth="1" />
            <text x={layout.x(PREMIERE) - 6} y={margin.top + 22} textAnchor="end" fontSize="11" fill="var(--violet)">
              &amp; Juliet opens · Nov 2019
            </text>
            {layout.laneBands.map(({ lane, top, cy }, i) => {
              const mark = WORDMARKS[lane.artist]
              const multi = lane.songs.length > 1
              const markW = mark?.w ?? 118
              const markH = mark?.h ?? 24
              return (
                <g key={lane.artist}>
                  {i > 0 && <line x1={8} x2={width - 4} y1={top} y2={top} stroke="var(--baseline)" strokeWidth="1" />}
                  {mark ? (
                    <image
                      href={`${import.meta.env.BASE_URL}artists/${mark.src}`}
                      x={margin.left - 14 - markW}
                      y={multi ? cy - markH - 1 : cy - markH / 2}
                      width={markW}
                      height={markH}
                      preserveAspectRatio="xMaxYMid meet"
                      role="img"
                      aria-label={lane.artist}
                      style={{ filter: 'brightness(0) invert(0.92)', opacity: 0.92 }}
                    />
                  ) : (
                    <text x={margin.left - 14} y={multi ? cy - 2 : cy + 4} textAnchor="end" fontSize="12.5" fontWeight="600" fill="var(--text-secondary)">
                      {lane.artist}
                    </text>
                  )}
                  {multi && (
                    <text x={margin.left - 14} y={cy + 13} textAnchor="end" fontSize="11" fill="var(--text-muted)">
                      {lane.songs.length} songs · {fmtStreams(lane.songs.reduce((t, s) => t + (s.streamsM || 0), 0))} streams
                    </text>
                  )}
                </g>
              )
            })}
          </>
        )}

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

        {labels.map(({ d, text, sub, pos, corner, box }) => {
          const anchorX =
            pos === 'above' || pos === 'below' ? d.cx : pos === 'right' ? box.x : box.x + box.w
          const anchor = pos === 'right' ? 'start' : pos === 'left' ? 'end' : 'middle'
          const size = layout.vertical ? 10.5 : 11
          let leader = null
          if (corner) {
            // Leader line from the label's near edge back to the bubble rim.
            const sx = pos === 'right' ? box.x - 2 : box.x + box.w + 2
            const sy = box.y + box.h / 2
            const dist = Math.hypot(d.cx - sx, d.cy - sy)
            const ex = d.cx - ((d.cx - sx) / dist) * (d.r + 2)
            const ey = d.cy - ((d.cy - sy) / dist) * (d.r + 2)
            leader = (
              <line x1={sx} y1={sy} x2={ex} y2={ey} stroke="var(--text-muted)" strokeWidth="1" opacity="0.6" />
            )
          }
          return (
            <g key={`lbl-${d.song.id}`} style={{ pointerEvents: 'none' }}>
              {leader}
              <text
                x={anchorX}
                y={box.y + 10}
                textAnchor={anchor}
                fontSize={size}
                fill="var(--text-secondary)"
              >
                {text}
                {sub && (
                  <tspan x={anchorX} dy="12" fontSize={size - 1} fill="var(--text-muted)">
                    {sub}
                  </tspan>
                )}
              </text>
            </g>
          )
        })}
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
