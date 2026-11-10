# 단비꼬 5단계: 실제 제품 데이터 연결

작업 경로: C:\dev\danbikko. 2026-11-11.

## 완료 범위

실제 RTD 30개 제품의 엑셀 시험 데이터를 랜딩, /products, /products/[slug], /compare에 연결했다. 점수·등급·공동순위에 시험 평가를 표시한다. 원료 품질 가정, 미확인 성분, 부분 원재료 목록, 자료상 공식 영양 확인 여부를 구분한다. 9개 제품은 공개 원재료 고시 대조 기록이 있고, 21개 제품은 신규 성분이 미확인이다. 실제 제품 이미지·전체 원재료·단백질 원료명·미확인 용량·확인일은 추정하지 않았다.

테이크핏 프로 레몬은 구버전 450ml 시험자료로 식별한다. 500ml 리뉴얼 제품의 확정 평가로 표시하지 않는다. 이 제품은 원본 30개 시험 평가 집단에 포함되며 원본 결과를 그대로 재현한다.

## 평가 원본과 계산

- data/sources/protein-drinks-v08.xlsx: 사용자 첨부 원본의 동일한 복사본.
- SHA-256: 163ca127865498f14b4af8d489eeb3e8865a4e9891de866e1c6c526e3ecd46a8
- data/sources/v08-extracted.json: 시트별 셀 값과 원본 수식, 해시를 보존.
- src/data/scoring-v08.json: 원본에서 추출한 감점 항목·처리 방식·가중치·연속 점수 구간·등급 조건.
- src/lib/scoring-v08.ts: 계산 엔진. 검색 전에 전체 제품 집단을 평가한다.

원본 보간식, 항목별 환산, 최종 소수점 한 자리 반올림, 공동순위, 상위 10% 및 85점 이상 S 조건을 유지한다. 기존 B/C 등급 상한은 엑셀과 동일하게 종합·다이어트에만 적용한다. 동점은 같은 순위이며 S 판정도 공동순위 기준이다.

첨가물 공란은 데이터에서 null로 유지한다. 엑셀의 숫자 계산에서는 감점 0으로 취급되지만 성분 부재나 검증 완료로 표시하지 않는다. 미확인 영양값·원료 품질 입력이 빠지면 점수를 생성하지 않는다. 류신은 공식 확인 상태의 값이 있을 때만 정보로 표시하고 계산에 사용하지 않는다.

## 데이터 구조 및 갱신

src/data/products.json은 제품 정보와 입력값을 관리하는 파일이다. evaluations는 입력 파일에 점수를 고정 저장하지 않으며 제품 조회 시 엔진이 계산한다. 추가 제품도 같은 Product 타입과 scoringInput 계약을 따르면 페이지 코드를 수정할 필요가 없다. id와 slug는 고유해야 한다.

- nutrition: 단백질·당류·열량과 기준. 모르는 항목은 null.
- scoringInput: 원료 품질 가정, 성분별 0/1/null 입력, 고시 대조된 성분 키, 기존 등급 상한, 시험 평가 상태.
- verification.fields: 항목별 공식 확인 기록 / 고시 대조 기록 / 시험 입력 / 미확인 상태와 sourceIds.
- sources: 공식·판매 참고 자료, 원재료 고시, 2차자료 URL과 메모. 원문 출처를 보존하며 이번 작업에서 외부 페이지를 새로 검증했다고 표시하지 않는다.
- workbook: 원본 파일·해시·시트·행·원본 ID 추적 정보.

Excel 원본을 다시 반입하려면 프로젝트 폴더에서 corepack.cmd yarn data:import를 실행한다. 이 명령은 보존된 원본 30개용으로 products.json, scoring-v08.json, 추출 원문, 엑셀 대조 기준 파일을 다시 생성하므로 수동 수정한 products.json을 덮어쓴다.

제품을 직접 추가·수정할 때는 products.json과 출처·검증 상태를 함께 수정한다. 개발 서버는 데이터 변경을 반영하며, 프로덕션 빌드에 반영하려면 다시 build해야 한다. 재계산은 제품 조회 및 빌드 과정에서 자동 실행된다. 원본 30개와 결과가 달라지는 의도적 데이터 변경은 원본 재현 테스트와 별도 평가 집단으로 관리해야 한다.

## 검증 결과

- TypeScript: 통과
- lint: 통과
- build: 통과
- 자동 테스트: 14개 통과
- 원본 엑셀 점수: 120/120 일치
- 원본 엑셀 공동순위: 120/120 일치
- 원본 엑셀 등급: 120/120 일치
- 390×844, 1440×900에서 실제 제품 검색, 네 티어 전환, 표시된 120개 점수·순위, 비교 선택·교체·새로고침 유지 확인
- 검사한 정상 경로에서 콘솔 오류와 페이지 가로 넘침 없음. 모바일 비교표 내부 가로 스크롤 확인
- 가중치, 보간 경계/중간값, 반올림, 등급 상한, 공동순위, 데이터 변경/추가 후 재계산, null과 0 구분, 류신 점수 제외 검증
- 기존 테스트 데이터 기반 UI 회귀와 별도 빈 데이터 회귀 유지

tests/scoring-v08.spec.ts는 원본 xlsx 파일을 직접 읽어 계산 결과와 대조한다. 계산 엔진에서 만든 값을 기대값으로 재사용하지 않는다. 세부 결과는 artifacts/stage5-score-verification.json에 보존했다.

검증 명령:

    corepack.cmd yarn typecheck
    corepack.cmd yarn lint
    corepack.cmd yarn build
    corepack.cmd yarn test:ui

UI 테스트는 3100(실제 데이터), 3101(격리된 테스트 데이터), 3102(빈 데이터) 서버를 자동 시작·종료한다. 개발 서버와 격리된 빌드 디렉터리를 사용한다.

## 화면 캡처

- artifacts/stage5-landing-390.png / stage5-landing-1440.png
- artifacts/stage5-products-390.png / stage5-products-1440.png
- artifacts/stage5-detail-390.png / stage5-detail-1440.png
- artifacts/stage5-compare-390.png / stage5-compare-1440.png
- 각 화면의 -viewport.png는 최초 뷰포트 캡처다.

위 캡처는 실제 30개 제품의 시험 데이터이며, 과거 TEST-ONLY 캡처와 구분된다. 제품 이미지가 없으므로 기존 이미지 확인 중 표현을 유지했다.

## 변경 파일

신규:
- data/sources/protein-drinks-v08.xlsx
- data/sources/v08-extracted.json
- scripts/read-workbook.ps1
- scripts/import-v08.mjs
- src/data/scoring-v08.json
- src/lib/scoring-v08.ts
- src/components/catalog/product-evidence.tsx
- tests/fixtures/v08-expected.json
- tests/fixtures/empty.json
- tests/scoring-v08.spec.ts
- tests/real-products.spec.ts
- STAGE5_REPORT.md, artifacts/stage5-* 캡처와 검증 결과

수정:
- src/data/products.json
- src/lib/catalog.ts
- src/lib/product-repository.ts
- src/components/catalog/product-card.tsx
- src/components/catalog/products-view.tsx
- src/components/catalog/compare-view.tsx
- src/app/(catalog)/products/[slug]/page.tsx
- src/app/catalog.css: 상태 텍스트·출처 링크 스타일만 추가
- package.json: data:import 스크립트 추가
- playwright.config.ts, tests/landing.spec.ts: 실제 데이터와 빈 데이터 검증 분리
- next.config.ts, eslint.config.mjs, .gitignore: 빈 데이터 테스트 빌드 격리
- tsconfig.json, next-env.d.ts: Next.js의 생성 타입 경로

기존 자료 8개와 랜딩 globals.css는 원본 해시와 일치한다. 랜딩 페이지 소스·심볼·폰트·색상·배치는 재설계하지 않았다. 신규 패키지 설치 없이 구현했다. 기존 OneDrive 프로젝트와 첨부 엑셀을 보존했다. Git push와 배포는 하지 않았다.
