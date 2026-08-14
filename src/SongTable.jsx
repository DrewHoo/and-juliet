import { fmtDate, fmtStreams } from './Timeline.jsx'

export default function SongTable({ songs, selected, onSelect }) {
  const rows = [...songs].sort((a, b) => a.date.localeCompare(b.date))
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Song</th>
            <th>Original artist</th>
            <th>Released</th>
            <th className="col-hide-mobile">Album</th>
            <th className="num">Hot 100</th>
            <th className="num">Streams</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr
              key={s.id}
              className={selected === s.id ? 'selected' : undefined}
              onClick={() => onSelect(selected === s.id ? null : s.id)}
              style={{ cursor: 'pointer' }}
            >
              <td><strong>{s.title}</strong></td>
              <td><span className="artist">{s.artist}</span></td>
              <td>{fmtDate(s.date)}</td>
              <td className="col-hide-mobile">{s.album || '—'}</td>
              <td className="num">{s.hot100 ? `#${s.hot100}` : '—'}</td>
              <td className="num">{fmtStreams(s.streamsM)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
