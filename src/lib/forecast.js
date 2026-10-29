// 월별 관람객 표(ym: "2025-07") 로 "작년 이맘때"와 "이번 달 예상"을 계산합니다.
// 예상 = 작년 같은 달 관람객 × (최신 연도의 실적 합 ÷ 전년 같은 달 합). 단순 추정이라 참고용입니다.
export const ymOf = (y, m) => `${y}-${String(m).padStart(2, '0')}`

export const addMonths = (y, m, k) => {
  const t = y * 12 + (m - 1) + k
  return [Math.floor(t / 12), (t % 12) + 1]
}

export function buildSeries(months, key) {
  const map = new Map()
  for (const r of months) if (typeof r[key] === 'number') map.set(r.ym, r[key])
  return map
}

const latestYear = (map) => {
  const last = [...map.keys()].sort().pop()
  return last ? Number(last.slice(0, 4)) : null
}

// 최신 연도의 실적 합 / 전년 같은 달 합 (원값)
export function growthRaw(map) {
  const y = latestYear(map)
  if (!y) return 1
  let cur = 0, prev = 0
  for (let m = 1; m <= 12; m++) {
    const a = map.get(ymOf(y, m)), b = map.get(ymOf(y - 1, m))
    if (a != null && b != null) { cur += a; prev += b }
  }
  return prev ? cur / prev : 1
}

const clamp = (g) => Math.min(1.4, Math.max(0.6, g))

// { value, kind: 'actual' | 'expected' | null }
export function valueFor(map, year, month) {
  const a = map.get(ymOf(year, month))
  if (a != null) return { value: a, kind: 'actual' }
  const b = map.get(ymOf(year - 1, month))
  if (b != null) return { value: Math.round(b * clamp(growthRaw(map))), kind: 'expected' }
  return { value: null, kind: null }
}

const pct = (a, b) => (a != null && b ? (a / b - 1) * 100 : null)

export function buildStats(map, today = new Date()) {
  const Y = today.getFullYear(), M = today.getMonth() + 1
  const now = valueFor(map, Y, M)
  const lastSame = valueFor(map, Y - 1, M)
  const [py, pm] = addMonths(Y - 1, M, -1)
  const lastPrev = valueFor(map, py, pm)
  const bars = []
  for (let k = -3; k <= 3; k++) {
    const [ly, lm] = addMonths(Y - 1, M, k)
    const [ty, tm] = addMonths(Y, M, k)
    bars.push({ label: `${tm}월`, last: valueFor(map, ly, lm), now: valueFor(map, ty, tm), isCurrent: k === 0 })
  }
  return {
    year: Y,
    month: M,
    now,
    lastSame,
    vsLastYear: pct(now.value, lastSame.value),
    lastMom: pct(lastSame.value, lastPrev.value),
    growth: (growthRaw(map) - 1) * 100,
    bars,
  }
}

export const fmt = (n) => (n == null ? '-' : n >= 10000 ? `${(n / 10000).toFixed(1)}만` : n.toLocaleString())
export const fmtPct = (p) => (p == null ? '-' : `${p > 0 ? '+' : ''}${p.toFixed(1)}%`)
