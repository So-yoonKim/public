import { useEffect, useMemo, useState } from 'react'
import { CATEGORIES, SPOTS } from './data/spots'
import { buildSeries, buildStats, fmt, fmtPct } from './lib/forecast'
import SpotDetail from './components/SpotDetail'

export default function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [category, setCategory] = useState('전체')
  const [keyword, setKeyword] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    fetch('/api/visitors')
      .then(async (r) => {
        const j = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(j.error || `서버 오류 (${r.status})`)
        setData(j)
      })
      .catch((e) => setError(e.message))
  }, [])

  const stats = useMemo(() => {
    if (!data) return {}
    return Object.fromEntries(SPOTS.map((s) => [s.id, buildStats(buildSeries(data.months, s.key))]))
  }, [data])

  const shown = useMemo(() => {
    const k = keyword.toLowerCase().replace(/\s+/g, '')
    return SPOTS.filter(
      (s) => (category === '전체' || s.category === category) && (!k || `${s.name}${s.category}${s.desc}`.toLowerCase().replace(/\s+/g, '').includes(k))
    )
  }, [category, keyword])

  const selected = SPOTS.find((s) => s.id === selectedId)

  const select = (id) => {
    setSelectedId(id)
    setTimeout(() => document.getElementById('detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  return (
    <>
      <header className="hero">
        <h1>🌋 서귀포 관광지 예상 관광객</h1>
        <p>직영관광지 6곳의 월별 관람객 통계로 이번 달 붐빌 곳을 가늠해 보세요.</p>
        <input className="search" type="search" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="관광지 검색 (예: 폭포, 감귤)" aria-label="관광지 검색" />
      </header>

      <nav className="cats" aria-label="실내 실외">
        {CATEGORIES.map((c) => (
          <button key={c} className={c === category ? 'cat on' : 'cat'} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </nav>

      {error && <p className="error">{error}</p>}
      {!data && !error && <p className="center muted">통계를 불러오는 중…</p>}
      {shown.length === 0 && <p className="center muted">"{keyword}"에 맞는 관광지가 없어요.</p>}

      <section className="grid">
        {shown.map((s) => {
          const st = stats[s.id]
          return (
            <button key={s.id} className={s.id === selectedId ? 'card on' : 'card'} onClick={() => select(s.id)}>
              <span className="badge">{s.category}</span>
              <span className="emoji">{s.emoji}</span>
              <strong>{s.name}</strong>
              {st ? (
                <>
                  <span className="big">{fmt(st.now.value)}명</span>
                  <span className="sub">{st.month}월 {st.now.kind === 'actual' ? '실적' : '예상'} · 작년 대비 <b className={st.vsLastYear >= 0 ? 'up' : 'down'}>{fmtPct(st.vsLastYear)}</b></span>
                </>
              ) : (
                <span className="sub">–</span>
              )}
            </button>
          )
        })}
      </section>

      {selected && stats[selected.id] ? (
        <SpotDetail spot={selected} stats={stats[selected.id]} />
      ) : (
        data && <p className="center muted hint">위에서 관광지를 누르면 지도와 작년 이맘때 관광객 변동이 아래에 나타나요.</p>
      )}

      <footer className="footer">
        자료: 제주특별자치도 서귀포시_직영관광지 관람객수 추이 (공공데이터포털){data && data.updated ? ` · 데이터 기준일 ${data.updated}` : ''} · 지도: 네이버 지도
      </footer>
    </>
  )
}
