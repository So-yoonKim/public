// Vercel 서버리스 함수: 서귀포시 직영관광지 관람객수 추이(공공데이터포털 15125100)를 월별 하나의 표로 합쳐 돌려줍니다.
// 환경변수 DATA_GO_KR_KEY 가 필요합니다. 키는 브라우저로 나가지 않습니다.
const BASE = 'https://api.odcloud.kr/api/15125100/v1/'
// 2018-06 ~ 2025-08. 기준연월이 "2025-06-18" 처럼 엑셀 날짜 오류로 저장돼 있어 "2018년 6월"로 해석합니다(월-연도 두 자리).
const OLD_SET = 'uddi:258f6b02-0967-4fed-b337-83e46cdbba73'
// 2025-01 ~ 최신. 기준연도/기준월 숫자 컬럼.
const NEW_SET = 'uddi:32a1b877-af20-4505-a76a-fd389ebd30ca'
const SPOTS = ['천지연폭포', '정방폭포', '중문대포 주상절리대', '천제연폭포', '산방산_용머리', '감귤박물관']

const pad = (n) => String(n).padStart(2, '0')
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null)

async function load(id, key) {
  const url = BASE + id + '?' + new URLSearchParams({ page: '1', perPage: '500', serviceKey: key })
  const r = await fetch(url)
  if (!r.ok) throw new Error(`공공데이터 응답 오류 (${r.status}). 인증키와 활용신청 상태를 확인하세요.`)
  const j = await r.json()
  return j.data || []
}

export default async function handler(req, res) {
  const key = process.env.DATA_GO_KR_KEY
  if (!key) return res.status(500).json({ error: 'DATA_GO_KR_KEY 환경변수가 없습니다. 등록 후 Redeploy 하세요.' })
  try {
    const [oldRows, newRows] = await Promise.all([load(OLD_SET, key), load(NEW_SET, key)])
    const byYm = new Map()
    const put = (ym, row) => {
      const cur = byYm.get(ym) || { ym }
      for (const s of SPOTS) cur[s] = num(row[s])
      byYm.set(ym, cur)
    }
    for (const row of oldRows) {
      const m = /^\d{4}-(\d{2})-(\d{2})$/.exec(String(row['기준연월'] || ''))
      if (m) put(`20${m[2]}-${m[1]}`, row)
    }
    for (const row of newRows) put(`${row['기준연도']}-${pad(row['기준월'])}`, row) // 겹치는 달은 새 자료가 우선
    const months = [...byYm.values()].sort((a, b) => a.ym.localeCompare(b.ym))
    res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=86400')
    return res.status(200).json({ updated: newRows[0] ? newRows[0]['데이터기준일자'] : null, months })
  } catch (e) {
    return res.status(502).json({ error: e.message || '데이터를 불러오지 못했습니다.' })
  }
}
