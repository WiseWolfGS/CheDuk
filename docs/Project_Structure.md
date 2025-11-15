# CheDuk 프로젝트 구조

이 문서는 CheDuk 프로젝트의 주요 파일 및 디렉토리 구조와 각각의 역할을 설명하여, 코드베이스를 쉽게 탐색하고 이해할 수 있도록 돕습니다.

## 📂 최상위 디렉토리

-   `.github/`: GitHub Actions를 사용한 CI/CD 워크플로우 설정이 위치합니다.
-   `cheduk-frontend/`: Vite + React 기반의 프론트엔드 애플리케이션입니다. 사용자가 보는 모든 UI와 상호작용 로직이 여기에 포함됩니다.
-   `docs/`: 게임 규칙, 개발 계획, 로그 등 프로젝트의 모든 문서가 저장됩니다.
-   `packages/`: 여러 애플리케이션에서 공유될 수 있는 독립적인 로직 및 유틸리티 패키지들이 위치합니다.
-   `remix-app/`: 향후 실시간 멀티플레이어 기능을 담당할 백엔드 애플리케이션입니다.
-   `pnpm-workspace.yaml`: `pnpm` 워크스페이스를 정의하여 모노레포를 관리합니다.
-   `biome.json`: Biome 포맷터 및 린터의 설정을 정의합니다.
-   `docker-compose.yml`: Docker를 사용한 컨테이너 환경 구성을 정의합니다.
-   `tsconfig.json`: 모노레포 전체의 TypeScript 기본 설정을 정의합니다.

---

## Frontend: `cheduk-frontend/`

게임의 시각적 표현과 사용자 상호작용을 담당합니다.

-   `src/main.tsx`: React 애플리케이션의 최상위 진입점입니다.
-   `src/App.tsx`: 애플리케이션의 루트 컴포넌트입니다. 전역 레이아웃, 페이지 라우팅, `ActionChoiceModal`과 같은 전역 모달을 관리합니다.
-   `src/index.css`: Tailwind CSS 지시문을 포함한 전역 스타일시트입니다.

### `src/store/`

-   `gameStore.ts`: **(매우 중요)** Zustand를 사용한 전역 상태 관리 스토어입니다. 게임의 모든 상태(`gameState`)와 상태를 변경하는 핵심 로직(`handleTileClick`, `performAction` 등)이 중앙 집중되어 있습니다. 프론트엔드 로직의 "두뇌" 역할을 합니다.

### `src/pages/`

-   `GamePage.tsx`: 게임 플레이 화면 전체를 구성하는 페이지 컴포넌트입니다. `PlayerInfo`, `Board`, `GameLog` 등 여러 컴포넌트를 조합하여 게임 UI 레이아웃을 형성합니다.

### `src/components/`

재사용 가능한 UI 조각들입니다.

-   `Board.tsx`: **(핵심 컴포넌트)** 게임 보드를 SVG로 렌더링하고, 타일 클릭, 유효 이동 경로 표시 등 사용자의 가장 핵심적인 상호작용을 처리합니다.
-   `Piece.tsx`: 개별 게임 기물을 렌더링하는 컴포넌트입니다.
-   `PlayerInfo.tsx`: 각 플레이어의 정보(이름, 첩보 점수, 잡은 기물)를 표시합니다.
-   `ActionChoiceModal.tsx`: 첩자(Spy)와 같이 여러 행동(이동, 정보 수집 등)이 가능할 때 사용자에게 선택지를 제공하는 모달입니다.
-   `GameOverModal.tsx`: 게임 종료 시 승자를 표시하고 재시작 버튼을 제공하는 모달입니다.
-   `GameLog.tsx`: 향후 게임 기록이나 컨트롤 버튼이 위치할 영역입니다. (현재는 플레이스홀더)

### `src/data/`

-   `board-data.ts`: 게임 보드를 구성하는 각 육각 타일의 정적 SVG 경로 데이터를 담고 있습니다.

---

## Packages: `packages/`

애플리케이션 간에 공유되는 재사용 가능한 코드 모음입니다.

### `packages/core-logic/`

**게임 엔진** 역할을 하는 가장 중요한 패키지입니다. UI와 완전히 분리된 순수 게임 규칙과 로직을 담당합니다.

-   `src/index.ts`: `createInitialGameState`, `getValidActions`, `performAction` 등 외부(주로 `gameStore`)로 노출되는 핵심 함수들을 정의하고 구현합니다.
-   `src/types.ts`: `GameState`, `Piece`, `Player` 등 게임의 모든 핵심 데이터 구조에 대한 TypeScript 타입을 정의합니다.
-   `src/moves/`: 각 기물의 이동 규칙을 생성하는 로직이 기물별 파일로 분리되어 있습니다.
    -   `index.ts`: 각 기물별 이동 생성 함수들을 하나로 모아 `MOVE_GENERATORS` 맵을 만듭니다.
    -   `utils.ts`: 좌표 계산, 보드 경계 확인 등 여러 이동 로직에서 공통으로 사용되는 헬퍼 함수들이 있습니다.

### `packages/geometry-hex/`

육각 그리드와 관련된 기하학적 데이터 및 유틸리티를 다룹니다.

-   `src/index.ts`: 보드의 행/열 개수(`ROWS`, `COLS`)와 같은 그리드 관련 상수와 데이터를 정의합니다.

---

## Backend: `remix-app/`

향후 실시간 멀티플레이어 기능을 구현하기 위한 백엔드 프로젝트입니다. (현재는 초기 단계)

-   `server.ts`: `Socket.IO`를 사용하여 클라이언트와 실시간 통신을 처리할 웹소켓 서버 로직이 포함될 예정입니다.
-   `app/`: Remix 프레임워크의 규칙에 따른 애플리케이션 코드 디렉토리입니다.
    -   `root.tsx`: 애플리케이션의 전체 HTML 뼈대를 정의합니다.
    -   `routes/`: 페이지 경로에 따른 라우팅을 정의합니다.
