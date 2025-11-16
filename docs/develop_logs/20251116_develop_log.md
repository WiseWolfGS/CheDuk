# CheDuk 개발 로그 (2025-11-16)

---

### 1. 대사관 재점령/부활 시스템 보완

*   **대사관 점령 상태 추적 개선**
    * `packages/core-logic/src/index.ts`에서 대사관 상태를 계산하는 `recomputeEmbassyState`를 재작성해, **점령 → 해방 → 재점령** 단계별로 `embassyRecaptureTurn`을 `(-1 / null / turn)` 3단계로 추적하도록 변경했습니다.
    * 대사관에 아군 기물이 직접 재진입하지 않은 채 비어 있는 상태에서는 계속 `-1`로 남아 대사가 부활할 수 없습니다.

*   **부활 검증 로직 강화**
    * `resurrect` 액션 처리 시 해당 칸 비어 있음, 대사관 좌표 일치, 대사관 점령 여부, 재점령 턴 경과까지 모두 검사하도록 로직을 정리했습니다.
    * 새 규칙을 검증하는 테스트(`tests/actions.test.ts`)를 작성해 “점령·비움·재점령” 시나리오와 부활 실패 케이스(점령 중/재점령 전)를 모두 커버했습니다.

### 2. 프론트엔드 특수 행동 UI 개편

*   **특수 행동 모달 분리**
    * `cheduk-frontend/src/components/SpecialActionModal.tsx`를 추가해, 대사·첩자 부활을 단일 버튼에서 선택할 수 있도록 구현했습니다.
    * Zustand 스토어(`store/gameStore.ts`)에 `specialActionModal` 상태와 `SpecialActionOption` 타입을 추가하고, 글로벌 특수 행동을 pieceId 별로 묶어 `즉시 실행` vs `위치 선택` 플로우를 나눴습니다.

*   **무한 렌더링 버그 해결**
    * `specialActionModal` 관련 상태를 여러 selector로 분리해 React DevTools/React 18 환경에서 “getSnapshot should be cached” 경고와 최대 업데이트 깊이 오류가 발생하던 문제를 해결했습니다.

### 3. 특수 행동 라벨링/모달 공통화

*   `describeGameAction` 유틸을 추가해, ActionChoiceModal/SpecialActionModal 모두 같은 라벨을 사용하도록 정리했습니다.
*   기존 모달(`ActionChoiceModal`)은 이동/정보 획득 등을 담당하고, 새 모달은 대사·첩자 부활 전용으로 역할을 명확히 분리했습니다.

### 4. TypeScript 빌드 안정화

*   대사관 관련 리팩터링 이후 `actor` 인자가 더 이상 필요 없어져 제거했고, 그 결과로 발생한 “unused parameter” 및 `coordsEqual`의 `null`/`undefined` 혼용 문제를 수정했습니다.
*   CI 사전 점검을 위해 `pnpm --filter @cheduk/core-logic exec tsc --noEmit` 기준으로 오류가 없는지 확인했습니다.

---

**비고**

*   새 규칙은 로컬 플레이/테스트/프론트엔드 UI까지 확인 완료.
*   추후 온라인 모드나 추가 규칙 적용 시, 이 구조를 활용해 특수 행동을 확장할 수 있습니다.
