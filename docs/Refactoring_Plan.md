# CheDuk 코드 개선 계획 (Refactoring Plan)

이 문서는 CheDuk 프로젝트의 코드를 더 깔끔하고, 유지보수하기 쉬우며, 이해하기 좋은 구조로 개선하기 위한 통합 리팩토링 계획입니다. 기존 계획과 코드 리뷰 내용을 종합하여 다음 단계의 목표를 명확히 합니다.

---

## 1단계: 프론트엔드 아키텍처 개선 (`cheduk-frontend`)

### 1.1. `Board.tsx` 컴포넌트 리팩토링

`Board.tsx`는 가장 복잡한 컴포넌트이며, 최근 `useMemo`와 `Set`을 활용한 최적화가 매우 성공적으로 적용되었습니다. 이제 여기서 더 나아가 컴포넌트의 역할을 명확히 분리하는 것을 목표로 합니다.

- **1. 유틸리티 및 데이터 로직 분리 (즉시 실행 추천)**
  - **`getPathCenter` 함수:** SVG 경로를 계산하는 이 순수 함수를 `src/utils/svgUtils.ts`와 같은 별도의 유틸리티 파일로 분리합니다. 이를 통해 `Board.tsx`는 렌더링 로직에 더 집중할 수 있습니다.
  - **`coordinateToCellMap` 생성 로직:** 보드 타일의 중심점을 미리 계산하는 이 로직 또한 `src/data/board-layout.ts`와 같은 별도의 데이터 파일로 분리하여, `Board.tsx`는 계산된 데이터를 가져와 사용하도록 만듭니다.
  - **"매직 넘버" 제거:** 보드 회전에 사용되는 하드코딩된 값(`rotate(90, 413.75669, 458.02477)`)들을 명확한 이름의 상수로 추출하여 코드의 의도를 명확히 합니다.

- **2. `HexTile` 컴포넌트 분리 (심화)**
  - `Board.tsx` 내부의 렌더링 루프를 `HexTile`이라는 개별 컴포넌트로 분리합니다.
  - `Board.tsx`는 `HexTile` 컴포넌트를 반복해서 그리는 역할만 담당하게 하여 구조를 단순화합니다.
  - **(선택) `useTileState` 커스텀 훅 도입:** `HexTile` 내부에서 타일의 상태(선택 여부, 이동 가능 여부, 색상 등)를 결정하는 로직을 `useTileState(tile)`와 같은 커스텀 훅으로 분리하면, 상태 계산 로직을 재사용하고 컴포넌트를 더 깔끔하게 유지할 수 있습니다.

### 1.2. 전역 상태 관리(`gameStore.ts`) 개선

`gameStore`는 프론트엔드 로직의 핵심입니다. 복잡도를 낮추고 예측 가능성을 높이는 것을 목표로 합니다.

- **`handleTileClick` 로직 분리:** 현재 비대해진 `handleTileClick` 함수를 `handleResurrectionClick`, `handleMoveClick`, `handleSelectionClick` 등 역할에 따라 작은 내부 헬퍼 함수로 분리하여 가독성을 높입니다.
- **`resetGame` 로직 보완:** 현재 `resetGame`은 `gameState`만 초기화합니다. `selectedTile`, `validActions`, `resurrectionState` 등 파생되는 UI 상태들도 함께 초기화하여, 게임 재시작 시 이전 상태가 남는 잠재적 버그를 방지합니다.
- **액션 상태 흐름 명확화:** `ActionChoiceModal`에서 'Move'를 선택했을 때, `gameStore`의 `validActions` 상태를 이동 관련 액션만 남도록 필터링하여 이후 타일 클릭 처리 로직의 복잡성을 줄입니다.

---

## 2단계: 핵심 로직 개선 (`packages/core-logic`)

게임의 "두뇌"에 해당하는 `core-logic`의 가독성과 견고함을 높입니다.

- **`getValidActions` 함수 분리:** 현재 이 함수는 선택된 기물이 있을 때와 없을 때(부활 등) 다른 종류의 액션을 생성합니다. 이를 `getPieceActions(coord, gameState)`와 `getGlobalActions(gameState)`로 분리하여 역할과 책임을 명확히 합니다.
- **`getTerritories` 로직 리팩토링:** 현재의 `while` 루프 기반 영역 계산 로직은 복잡하고 수정이 어렵습니다. 장기적으로는 육각 그리드의 큐브 좌표계와 수학적 부등식을 사용하여 "해당 좌표가 특정 영역에 속하는가?"를 판별하는 선언적인 함수로 대체하는 것을 고려합니다.
- **초기 기물 배치 방식 개선:** `createInitialGameState` 내부의 긴 `setPiece` 호출 목록을, 좌표와 기물 정보를 담은 객체 배열 같은 선언적인 데이터 구조로 변경하여 가독성과 유지보수성을 높입니다.

---

## 3단계: 장기적인 프로젝트 품질 향상

- **Storybook 도입:** `PieceComponent`, `ActionChoiceModal` 및 위에서 제안된 `HexTile` 같은 UI 컴포넌트들을 분리된 환경에서 시각적으로 테스트하고 문서화합니다. 이를 통해 전체 게임을 실행하지 않고도 컴포넌트의 다양한 상태를 쉽게 개발하고 검증할 수 있습니다.
- **테스트 커버리지 확대:** `getPathCenter`와 같은 순수 함수에 대한 단위 테스트를 추가하고, "타일을 클릭했을 때 올바른 액션이 호출되는지"와 같은 컴포넌트-스토어 간의 상호작용을 검증하는 통합 테스트를 작성하여 코드 변경에 대한 안정성을 확보합니다.
- **빌드 시 데이터 전처리:** 1.1단계에서 제안된 `coordinateToCellMap` 분리를 넘어, `pnpm generate-board-data`와 같은 별도의 스크립트를 만들어 빌드 파이프라인에 통합합니다. 이를 통해 런타임에 수행되던 계산을 빌드 타임으로 옮겨 최종 사용자의 초기 로딩 성능을 극대화합니다.