# 단비꼬 4단계 구현 결과

작업 위치: C:\dev\danbikko

## 구현 범위

- /products: 네 티어 전환, 키보드 탭 탐색, 제품명·브랜드·맛 검색, 점수/제품명/단백질/당류 정렬, 모바일 2열·데스크톱 4열 카드.
- /products/[slug]: 기본 정보, 영양 기준과 성분, 단백질 원료, 감미료·첨가물, 네 티어 점수·등급·산정 이유, 출처·확인 상태, 비활성 구매 링크 영역. 없는 slug는 안내 화면.
- /compare: 2~4개 선택, 영양·원재료·네 티어 비교표, 모바일 표 내부 가로 스크롤, 고정 항목명 열, 삭제·교체·전체 해제. 교체창은 포커스 관리와 Escape 닫기 지원.
- 검색어·티어·정렬은 URL에 유지. 비교 선택은 브라우저 저장소에 유지. 손상된 저장 값·중복·삭제된 제품 ID는 무시.
- 랜딩의 기존 문구·색상·폰트·배치 유지. 검색과 제품 탐색을 목록으로 연결, 티어 제목을 해당 티어표로 연결. 제품 등록 시 기존 탐색 영역에 카드 표시.

## 데이터 연결

운영 데이터는 src/data/products.json이며 현재 빈 배열이다. 실제 제품 정보와 확정 평가 결과가 아직 전달되지 않아 가짜 제품·점수·순위를 넣지 않았다.

데이터 계약은 src/lib/catalog.ts의 Product와 Evaluation 타입을 따른다. 각 맛·용량 제품에 고유 id와 slug를 지정하며 type은 RTD만 허용한다. 필수 정보가 없으면 null로 명시한다. 원료·첨가물 배열의 null은 '확인 중', 빈 배열은 '없음 (확인됨)'이다. 영양 수치는 nutrition.basis의 제공량 기준으로 표시하며 임의 환산하지 않는다.

evaluations 키는 overall / protein / additives / diet이다. score·grade·rank·reasons·ruleVersion은 전달된 값을 그대로 표시한다. 이 단계에는 채점·감점·가중치 계산이 없다. 점수 정렬은 공급된 점수만 사용하며 순위를 새로 계산하지 않는다. 미확인 값은 정렬 마지막에 배치하고 0과 구분한다.

tests/fixtures/products.json은 테스트 전용이며 실제 제품이 아니다. 개발 모드에서 DANBIKKO_TEST_CATALOG가 명시된 별도 테스트 서버만 읽는다. production 모드에서는 해당 환경변수를 무시한다. 테스트 점수는 UI 검증값으로 확정 평가 로직을 의미하지 않는다.

## 검증 및 실행

- corepack.cmd yarn typecheck
- corepack.cmd yarn lint
- corepack.cmd yarn build
- corepack.cmd yarn test:ui

검증: 타입 검사·lint·build 통과. Playwright 7개 테스트 통과. 390×844 및 1440×900에서 검색·티어·정렬·선택 제한·새로고침 유지·삭제·교체·상세·빈 상태·잘못된 주소 확인. 검사한 정상 경로에서 콘솔 오류·페이지 가로 넘침 없음. 모바일 비교표의 내부 가로 스크롤 확인.

UI 테스트는 빌드 후 실행하며, 3100번 프로덕션 서버와 3101번 격리된 테스트 데이터 서버를 자동 시작·종료한다. 로컬 Microsoft Edge를 사용한다. 기존 3000번 개발 서버를 종료하지 않는다.

일반 개발: corepack.cmd yarn dev. 제품 탐색: http://127.0.0.1:3000/products

## 화면 결과

실제 데이터 상태:
- artifacts/stage4-landing-390.png, stage4-landing-1440.png
- artifacts/stage4-products-390.png, stage4-products-1440.png
- artifacts/stage4-compare-390.png, stage4-compare-1440.png

테스트 데이터로 검증한 UI (실제 제품·점수 아님):
- artifacts/TEST-ONLY-products-390.png, TEST-ONLY-products-1440.png
- artifacts/TEST-ONLY-detail-390.png, TEST-ONLY-detail-1440.png
- artifacts/TEST-ONLY-compare-390.png, TEST-ONLY-compare-1440.png

## 변경 파일

기존 수정:
- src/app/page.tsx — 랜딩 링크와 제품 영역 데이터 연결
- src/app/layout.tsx — 공유 선택 상태, 제품 데이터, 새 화면 스타일, 제공 심볼 파비콘
- src/components/product-search.tsx — 목록 검색 연결
- package.json — 전체 UI 테스트 실행 스크립트
- eslint.config.mjs, .gitignore — 격리 테스트 빌드 경로 제외
- tests/landing.spec.ts — 새 탐색 동작에 맞춘 검증
- tsconfig.json, next-env.d.ts — Next.js가 생성한 라우트 타입 경로

신규:
- src/app/(catalog)/layout.tsx
- src/app/(catalog)/products/page.tsx
- src/app/(catalog)/products/[slug]/page.tsx
- src/app/(catalog)/products/[slug]/not-found.tsx
- src/app/(catalog)/compare/page.tsx
- src/app/catalog.css
- src/components/catalog/shell.tsx
- src/components/catalog/products-view.tsx
- src/components/catalog/product-card.tsx
- src/components/catalog/selection.tsx
- src/components/catalog/compare-view.tsx
- src/components/catalog/landing-products.tsx
- src/lib/catalog.ts
- src/lib/product-repository.ts
- src/data/products.json
- next.config.ts — 기존 개발 서버와 격리 테스트 서버의 빌드 경로 분리
- playwright.config.ts
- tests/catalog.spec.ts
- tests/fixtures/products.json
- STAGE4_REPORT.md 및 위 캡처 파일

## 보존 및 남은 범위

제공 자료 8개와 기존 src/app/globals.css는 원본 해시와 일치한다. 신규 패키지는 추가하지 않았다. 기존 OneDrive 프로젝트는 수정하지 않았다. Git push와 배포는 하지 않았다.

실제 제품 데이터와 이미 확정된 평가 결과/산식 연결은 추후 전달 자료가 필요하다. 쿠팡 파트너스 URL·고지문 연결은 실제 링크 도입 단계의 작업이다.
