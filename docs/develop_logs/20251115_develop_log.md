# CheDuk 개발 로그 (2025-11-15)

---

### 1. 육각 그리드 거리 계산 및 선후공 결정 로직 구현

*   **정확한 육각 그리드 거리 계산 유틸리티 추가:**
    *   `packages/core-logic/src/moves/utils.ts`에 오프셋 좌표를 큐브 좌표로 변환하는 `offsetToCube` 함수와 두 큐브 좌표 간의 거리를 계산하는 `cubeDistance` 함수를 추가했습니다.
*   **대사 배치 후 첩자 배치 선후공 결정 로직 개선:**
    *   `packages/core-logic/src/index.ts`의 `placeAmbassador` 핸들러에서 대사 배치 후 첩자 배치 선후공을 결정할 때, 새로 추가된 `cubeDistance` 함수와 플레이어별 중앙점(레드: `{q: 5, r: 5}`, 블루: `{q: 5, r: 6}`)을 사용하여 정확한 거리를 계산하도록 수정했습니다.
    *   거리가 짧은 플레이어가 메인 게임의 선공이 되며, 첩자 배치는 후공 플레이어부터 시작하도록 로직을 반영했습니다.

### 2. 대사 배치 구역 (`AMBASSADOR_PLACEMENT_ZONES`) 명확화

*   사용자 피드백을 통해 대사 배치 규칙이 "플레이어별 중앙점으로부터 거리가 2 이상 4 이하인 타일"임을 명확히 했습니다.
*   초기에 이 규칙에 따라 `packages/core-logic/src/placement.ts`의 `AMBASSADOR_PLACEMENT_ZONES`를 재생성했으나, 시각적으로 문제가 있어 사용자께서 제공해주신 원래 버전으로 복원했습니다.
*   분석 결과, 사용자께서 제공해주신 `AMBASSADOR_PLACEMENT_ZONES` 목록이 이미 "거리 2-4" 규칙과 플레이어별 중앙점에 완벽하게 부합함을 확인했습니다. 따라서 `placement.ts` 파일은 현재 상태로 유지됩니다.

### 3. 첩자 배치 버그 수정 (한쪽이 모든 첩자를 배치하는 문제)

*   사용자께서 첩자 배치 시 한 플레이어가 모든 첩자를 한 번에 배치하는 버그를 보고해주셨습니다.
*   `packages/core-logic/src/index.ts`의 `placeSpy` 액션 핸들러 로직을 수정하여, 상대방에게 배치할 첩자가 남아있으면 턴을 넘기고, 그렇지 않으면 현재 플레이어가 남은 첩자를 계속 배치하도록 하여 규칙에 맞는 교대 배치 로직을 구현했습니다.

### 4. 최종 선후공 결정 로직 구현 (대사 거리 동점 시)

*   대사 배치 후 대사 거리가 동점인 경우, 첩자 배치가 모두 끝난 후 최종 선공을 결정하는 로직을 구현했습니다.
*   `packages/core-logic/src/index.ts`의 `placeSpy` 핸들러에서 모든 첩자 배치가 완료되었을 때, 대사 거리가 동점이었다면(즉, `mainGameFirstPlayer`가 `null`인 경우), 각 플레이어의 배치된 모든 첩자들의 중앙점으로부터의 거리 총합을 계산하여 더 짧은 쪽이 최종 선공이 되도록 했습니다.

### 5. 런타임/컴파일 오류 디버깅 및 수정

*   **런타임 오류 (`Uncaught TypeError: Cannot read properties of undefined (reading 'Red')`) 해결:**
    *   `PlayerInfo.tsx` 컴포넌트에서 `gameState`의 `infoScores`, `capturedPieces`, `unplacedPieces` 등의 속성이 `undefined`가 되어 발생하는 오류를 확인했습니다.
    *   원인은 `packages/core-logic/src/index.ts`의 `applyAction` 함수 내 `move` 및 `placeSpy` 액션 핸들러에서 새로운 `GameState` 객체를 반환할 때 `...gameState` 확산 연산자의 미묘한 동작으로 인해 일부 속성들이 누락되는 문제였습니다.
    *   모든 `GameState` 반환 경로에서 `...gameState` 확산 연산자를 제거하고, `GameState` 인터페이스의 모든 속성을 수동으로 명시적으로 나열하여 새로운 상태 객체를 구성하도록 수정하여 속성 누락을 방지했습니다.
*   **TypeScript 컴파일 오류 해결:**
    *   `cheduk-frontend/src/components/PlayerInfo.tsx`에서 `GameState` 타입을 찾을 수 없다는 오류를 해결하기 위해 `@cheduk/core-logic`에서 `GameState` 타입을 임포트하도록 추가했습니다.
    *   `packages/core-logic/src/index.ts`의 `createFallbackState` 및 `createInitialGameState` 함수에서 `capturedPieces` 및 `returningSpies`와 같은 빈 배열(`[]`)의 타입 추론 오류를 해결하기 위해 `[] as Piece[]`와 같이 명시적인 타입 캐스팅을 추가했습니다.

---
