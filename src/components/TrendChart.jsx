import { fmt } from '../lib/forecast'

// 작년(회색)과 올해(실적 초록 / 예상 주황 빗금)를 월별로 나란히 비교하는 막대 그래프
export default function TrendChart({ bars }) {
  const W = 520, H = 260, padX = 10, top = 30, bottom = 40
  const max = Math.max(1, ...bars.flatMap((b) => [b.last.value ?? 0, b.now.value ?? 0]))
  const gw = (W - padX * 2) / bars.length
  const bw = Math.min(26, gw / 2 - 4)
  const ch = H - top - bottom
  const y = (v) => top + ch - (v / max) * ch

  const bar = (v, x, fill) =>
    v.value == null ? null : (
      <g>
        <rect x={x} y={y(v.value)} width={bw} height={top + ch - y(v.value)} rx="3" fill={fill} />
        <text x={x + bw / 2} y={y(v.value) - 4} fontSize="9" textAnchor="middle" fill="#475569">{fmt(v.value)}</text>
      </g>
    )

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="작년과 올해 월별 관광객 수 비교">
      <defs>
        <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" fill="#fed7aa" />
          <rect width="3" height="6" fill="#f97316" />
        </pattern>
      </defs>
      {bars.map((b, i) => {
        const cx = padX + gw * i + gw / 2
        return (
          <g key={i}>
            {b.isCurrent && <rect x={cx - gw / 2 + 2} y={top - 22} width={gw - 4} height={ch + 22 + bottom - 6} rx="8" fill="#ecfeff" />}
            {bar(b.last, cx - bw - 1, '#94a3b8')}
            {bar(b.now, cx + 1, b.now.kind === 'expected' ? 'url(#hatch)' : '#0e7490')}
            <text x={cx} y={H - 16} fontSize="11" textAnchor="middle" fill={b.isCurrent ? '#0e7490' : '#64748b'} fontWeight={b.isCurrent ? 700 : 400}>{b.label}</text>
          </g>
        )
      })}
      <line x1={padX} x2={W - padX} y1={top + ch} y2={top + ch} stroke="#cbd5e1" />
    </svg>
  )
}
