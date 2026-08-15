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
