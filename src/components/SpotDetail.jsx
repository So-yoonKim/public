import NaverMap from './NaverMap'
import TrendChart from './TrendChart'
import { fmt, fmtPct } from '../lib/forecast'

export default function SpotDetail({ spot, stats }) {
  const { year, month, now, lastSame, vsLastYear, lastMom, growth, bars } = stats
  return (
    <section className="detail" id="detail">
      <h2>{spot.emoji} {spot.name}</h2>
      <p className="muted">{spot.desc} <a href={`/map3d.html?focus=${spot.id}`}>3D 지도에서 보기 →</a></p>
      <div className="detail-grid">
        <NaverMap spot={spot} />
        <div className="trend">
          <h3>작년 이맘때 관광객 수 변동</h3>
          <dl className="stats">
            <div><dt>{year}년 {month}월 {now.kind === 'actual' ? '실적' : '예상'}</dt><dd>{fmt(now.value)}명</dd></div>
            <div><dt>작년 {month}월</dt><dd>{fmt(lastSame.value)}명</dd></div>
            <div><dt>작년 대비</dt><dd className={vsLastYear >= 0 ? 'up' : 'down'}>{fmtPct(vsLastYear)}</dd></div>
            <div><dt>작년 {month}월의 전월 대비</dt><dd className={lastMom >= 0 ? 'up' : 'down'}>{fmtPct(lastMom)}</dd></div>
          </dl>
          <TrendChart bars={bars} />
          <p className="legend">
            <i className="sw last" /> 작년 <i className="sw act" /> 올해 실적 <i className="sw exp" /> 올해 예상
          </p>
          <p className="muted small">올해 실적은 전년 같은 기간 대비 {fmtPct(growth)}. 예상은 "작년 같은 달 × 이 증감률"로 계산한 참고용 추정치예요.</p>
        </div>
      </div>
    </section>
  )
}
