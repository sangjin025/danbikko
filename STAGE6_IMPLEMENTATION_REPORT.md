# 6단계 UI 개선 완료

작업 프로젝트: C:\dev\danbikko. 제품 이미지 조사·등록 제외.

## 구현
- 제품 목록 상단 간격 축소, 390×844 및 1440×900에서 첫 제품명 전체 노출 확인.
- 모바일2열·데스크톱4열 유지. 이름 영역과 평가/선택 위치 정리, 영양 및 출처 글자 가독성 개선.
- 카드·상세·비교 평가 정보 순서: 등급 → 순위 → 점수. 시험 평가 상태 유지.
- 티어 탭44px 이상 터치 영역, 포커스 표시, 모바일 위/아래 방향키 이동 지원.
- 상세의4티어 요약은 상시 표시. 산정 이유는 기본 details/summary로 펼치기. 중복 확인 중 문구 정리.
- 비교표 내부 세로/가로 스크롤, 헤더와 첫 열 고정, 맛·용량 식별 정보, 교체/삭제44px 영역.
- 비교 선택 바 높이를 ResizeObserver로 측정하여 body 하단 여백과 scroll-padding에 반영. 해제/비교 화면 진입 시 여백 복원.
- 검증 도중 발견한 기본 favicon.ico404는 기존 승인 심볼을 그대로 제공하는 정적 응답으로 해결.

## 변경 파일
- src/app/catalog.css
- src/components/catalog/product-card.tsx
- src/components/catalog/products-view.tsx
- src/components/catalog/selection.tsx
- src/components/catalog/product-evidence.tsx
- src/components/catalog/compare-view.tsx
- src/app/(catalog)/products/[slug]/page.tsx
- src/app/favicon.ico/route.ts (추가)
- tests/real-products.spec.ts (새 캡처 이름, 비교 평가 표시 순서 반영)
- tests/ui-refinements.spec.ts (추가: 첫 제품명 노출, DOM 정보 순서, 키보드, 선택 바 가림 방지, 고정 헤더, 산정 이유 펼치기)

## 보존
제품30개 데이터, v0.8 산식·배점·감점·등급 규칙, 원본8개 자료, 브랜드 컬러·폰트·심볼, 랜딩 문구와 레이아웃, 제품 이미지 대체 UI 유지.
원본 엑셀 SHA256: 163ca127865498f14b4af8d489eeb3e8865a4e9891de866e1c6c526e3ecd46a8.

## 최종 검증
- corepack.cmd yarn typecheck: 통과
- corepack.cmd yarn lint: 통과
- corepack.cmd yarn build: 통과
- corepack.cmd yarn test:ui: 16 passed (23.2s)
- 원본 엑셀120점수·120순위·120등급 일치.
- 실데이터 검색·4티어 전환·비교 교체·선택 유지, 테스트 데이터 정렬·최대4개 선택·삭제, 빈 목록 회귀 통과.
- 390/1440 브라우저 콘솔 오류 및 페이지 가로 넘침 없음. 비교표 내부 스크롤은 의도된 동작.
- 실행 환경의 NO_COLOR/FORCE_COLOR 경고만 출력됨(브라우저 콘솔 오류 아님).

## 캡처
artifacts/stage6-{landing,products,detail,compare}-{390,1440}.png 및 -viewport.png.
artifacts/stage6-selection-{390,1440}.png: 마지막 제품 선택 영역과 비교 바 간격.
artifacts/stage6-compare-scrolled-{390,1440}.png: 표 스크롤 후 고정 헤더.

Git push·배포 없음. 별도 승인 없는 이미지 연결 없음.
