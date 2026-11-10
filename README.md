# 단비꼬 Codex Handoff v3 — 최신 팔레트 반영

**현재 유효한 패키지는 v3입니다.** 이전 v1.1/v2 ZIP을 함께 넣지 마세요.

## 사용법
1. 현재 작업 중인 실제 Next.js 프로젝트를 에디터/Codex에서 연다.
2. 이 압축파일을 풀고 `danbikko-codex-handoff-v3/` 폴더를 프로젝트 루트에 복사한다.
3. Codex에 아래 한 줄을 보낸다:

   `프로젝트 루트의 danbikko-codex-handoff-v3/CODEX_START_HERE.md를 먼저 읽고 기존 앱을 분석해. 첫 응답에는 코드 수정 없이, 현재 기능 보존을 전제로 모바일/데스크톱 리디자인 계획과 수정 대상 파일 목록만 제시해줘. 이전 단비꼬 디자인 패키지(v1.1, v2)는 사용하지 마.`

4. Codex의 제안을 검토하고 승인한 뒤 구현 단계로 진행한다.

## 파일 설명
- `CODEX_START_HERE.md`: 구조 분석부터 페이지별 목표 및 검증까지의 상세 지시문
- `DESIGN_TOKENS.md`: 정확한 HEX 5개와 사용 원칙, 접근성 주의 사항
- `assets/symbol-only-approved.png`: 현재 선택된 **글자 없는** 동물 얼굴 심볼
- `assets/symbol-only-brand-navy.png`: 외형 변화 없이 `#1E3D6B`로 색만 조정한 버전
- `references/palette-589.png`: 선택한 Palette #589 스크린샷
- `references/palette-in-action.png`: 색상 활용 참고 (레이아웃이나 카드 배열은 **비참고**)
- `references/dribbble-mobile.png`: 레이아웃, 여백 및 정보 위계 참고

**이 ZIP은 소스코드가 아니며**, 프로젝트가 열려 있어야 Codex가 실제 구조를 파악할 수 있습니다.
