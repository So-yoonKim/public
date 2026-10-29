# 서귀포 관광지 예상 관광객

서귀포시 직영관광지 6곳(천지연폭포, 정방폭포, 중문·대포 주상절리대, 천제연폭포, 산방산·용머리해안, 감귤박물관)의 월별 관람객 통계로 "이번 달 예상 관광객"을 보여 주는 사이트. React + Vite, 배포는 Vercel.

- 실내 / 실외 카테고리, 관광지 검색
- 관광지를 누르면 아래에 **네이버 지도**(왼쪽)와 **작년 이맘때 관광객 수 변동**(오른쪽)이 나타납니다.
- 자료: 공공데이터포털 [제주특별자치도 서귀포시_직영관광지 관람객수 추이](https://infuser.odcloud.kr/oas/docs?namespace=15125100/v1) (2018-06 ~ 최신, 월별)

## 예상 값 계산 방식
`이번 달 예상 = 작년 같은 달 관람객 × (올해 실적 합 ÷ 전년 같은 달 합)`
증감률은 0.6~1.4배로 제한합니다. 단순 추정이라 참고용이며, 날씨·행사·휴장은 반영하지 않습니다. 올해 실적이 있는 달은 실적을 그대로 보여 줍니다.

## 환경변수 등록 절차
| 이름 | 어디에 쓰나 | 값 구하는 곳 |
|---|---|---|
| `DATA_GO_KR_KEY` | 서버리스 함수 `api/visitors.js` (브라우저에 노출 안 됨) | 공공데이터포털 > 마이페이지 > 개발계정 > 일반 인증키 (이 API 활용신청이 승인돼 있어야 함) |
| `VITE_NAVER_MAP_CLIENT_ID` | 브라우저의 네이버 지도 | 네이버 클라우드 플랫폼 > Application Services > Maps > Application 등록 후 Client ID |

### 1) 공공데이터 키
1. 공공데이터포털 로그인 > 마이페이지 > 개발계정에서 "일반 인증키"를 복사합니다.
2. 키는 **코드/GitHub에 넣지 마세요.** 아래 Vercel 환경변수에만 등록합니다.

### 2) 네이버 지도 Client ID
1. https://www.ncloud.com 가입 후 콘솔 > Services > AI·NAVER API > **Maps**(Application) 에서 Application 을 등록합니다. (결제수단 등록이 필요할 수 있으며, 개인 규모 사용량은 무료 한도 안입니다.)
2. 사용할 API 로 **Dynamic Map** 을 선택합니다.
3. **Web 서비스 URL** 에 `http://localhost:5173` 과 배포 주소(예: `https://내프로젝트.vercel.app`)를 등록합니다. 등록하지 않으면 지도가 인증 실패로 뜨지 않습니다.
4. 발급된 **Client ID** 를 복사합니다. (Client Secret 은 사용하지 않습니다.)

### 3) Vercel 에 등록
1. GitHub 저장소에 푸시한 뒤 Vercel > Add New Project > 저장소 선택 (Framework: Vite 자동 감지).
2. Settings > Environment Variables 에 위 두 값을 등록합니다 (Production / Preview / Development 모두).
3. **등록 후 Redeploy** 해야 적용됩니다.
4. 점검: 배포주소`/api/visitors` 를 열어 `{"months":[...]}` 가 나오면 정상. `DATA_GO_KR_KEY 환경변수가 없습니다` 면 등록·Redeploy 누락, `공공데이터 응답 오류` 면 키 또는 활용신청 문제입니다.
5. 지도가 비어 있으면: Client ID 오타, Web 서비스 URL 미등록을 확인하세요. 키가 없으면 지도 대신 안내 문구와 "네이버 지도에서 열기" 링크가 보입니다.

## 로컬 실행
Node.js LTS 설치 후:
```bash
npm install
cp .env.example .env   # 값 채우기
npx vercel dev         # /api 함수까지 함께 실행 (npm run dev 만으로는 /api 가 없어 통계가 안 뜹니다)
```

## 참고
- 관광지 좌표는 OpenStreetMap/위키백과 기준 대략 위치입니다. 정확한 위치는 "네이버 지도에서 열기"로 확인하세요. (`src/data/spots.js` 에서 수정)
- 원자료의 `기준연월`(2018-06 ~ 2025-08)은 엑셀 날짜 오류로 "2025-06-18" 처럼 저장돼 있어, 월-연도 두 자리로 해석합니다(`api/visitors.js`).
- 원자료에는 비어 있는 달(2020-04·05, 2022-12 ~ 2023-08 일부 등, "데이터 미집계")이 있어 그래프에서 막대가 빠질 수 있습니다.
