# CheDuk (체둑)
**영토 개념을 이용해 변형한 현대 추상 전략 보드게임**

체스와 장기에서 영감을 받아 육각형 타일 위에서 진행되는 2인용 추상 전략 보드게임입니다. 바둑의 '영토' 개념과 체스의 '기물 포획'을 결합한 독특한 시스템을 가지며, '수반 격파'와 '첩자 정보 승리'라는 두 가지 승리 조건을 통해 다채로운 전략적 선택지를 제공합니다.

---

## 📌 현재 상태 (Current Status)

현재 프로젝트는 **초기 환경 설정 및 구조화 단계**에 있습니다. `pnpm` 워크스페이스 기반의 모노레포 구조가 확립되었으며, 주요 내용은 다음과 같습니다.

- **워크스페이스 구성:** `cheduk-frontend`와 `remix-app`이라는 두 개의 프론트엔드 애플리케이션 및 공용 로직을 위한 `packages` 디렉토리로 구성되어 있습니다.
- **개발 환경:** `Vite`를 사용한 빠른 개발 서버가 준비되어 있으며, `Biome`을 통해 코드 품질을 일관되게 관리합니다.
- **배포 환경:** `Docker`와 `Docker Compose` 설정이 완료되어, 프로덕션 빌드 및 컨테이너화된 실행이 가능합니다.
- **다음 단계:** 확정된 [공식 규칙서](./docs/CheDuk_Rulebook_KOR.md)를 기반으로 핵심 게임 로직(`core-logic`)을 구현하는 것입니다.

---

## 🛠️ 기술 스택 (Tech Stack)

| 구분 | 기술 | 비고 |
|------|----------|------|
| **워크스페이스** | `pnpm` | 모노레포 관리 |
| **프론트엔드** | `React`, `TypeScript`, `Vite` | UI 및 클라이언트 로직 |
| **코드 품질** | `Biome` | 포맷팅 및 린트 |
| **컨테이너** | `Docker`, `Docker Compose` | 개발 및 배포 환경 격리 |
| **핵심 로직** | `TypeScript` | 초기 구현 (향후 Rust/WASM 전환 고려) |
| **백엔드 (계획)** | `Node.js`, `Express`, `Socket.IO` | 실시간 멀티플레이어용 |

---

## 🚀 시작하기 (Getting Started)

### 사전 요구사항
- Node.js (v20.x 이상)
- pnpm
- Docker 및 Docker Compose

### 1. 의존성 설치
프로젝트 루트 디렉토리에서 다음 명령어를 실행합니다.
```bash
pnpm install
```

### 2. 개발 서버 실행
다음 명령어를 실행하면 `cheduk-frontend`와 `remix-app`이 동시에 개발 모드로 실행됩니다.
```bash
pnpm run dev
```
- `cheduk-frontend`: http://localhost:5173 (Vite 기본 포트)
- `remix-app`: 포트 충돌 시 http://localhost:5174 등 다른 포트로 자동 할당될 수 있습니다.

### 3. 프로덕션 빌드 및 실행 (Docker)
다음 명령어로 전체 프로젝트의 프로덕션 이미지를 빌드하고 컨테이너를 실행할 수 있습니다.
```bash
docker compose up --build
```
- `cheduk-frontend`: http://localhost:3000
- `remix-app`: http://localhost:5173

---

## 📖 규칙서 (Rulebook)

게임의 상세한 규칙은 아래 공식 규칙서에서 확인하실 수 있습니다.

- [**체둑(CheDuk) 공식 규칙서 (한국어)**](./docs/CheDuk_Rulebook_KOR.md)

---

## 🗺️ 개발 로드맵 (Roadmap)

현재 로컬 2인 플레이 기능 구현을 목표로 하는 **MVP 개발**을 진행 중입니다. 상세 계획은 [전체 로드맵 문서](./docs/Roadmap.md)에서 확인하실 수 있습니다.

- **Phase 1: 핵심 게임 로직 구현 (`packages/core-logic`)**
  - 게임 상태, 보드, 기물 등 기본 데이터 구조 정의
  - 각 기물의 이동 및 특수 규칙 함수 구현
  - 승리/패배 조건 판정 로직 구현
  - `Vitest`를 사용한 단위 테스트 작성

- **Phase 2: 프론트엔드 UI 개발 (`cheduk-frontend`)**
  - SVG/Canvas를 사용한 육각 보드 및 기물 렌더링
  - 사용자의 기물 선택 및 이동 상호작용 구현
  - 게임 정보(점수, 턴 등) UI 표시

- **Phase 3: 통합 및 MVP 완성**
  - `core-logic`과 `cheduk-frontend`를 연결하여 로컬 2인 플레이 기능 완성

---

## 🤝 기여 방법 (Contributing)

이슈 및 PR을 언제나 환영합니다! 개발 초기인 만큼, 규칙 구현과 UI/UX 개선을 주요 과제로 삼고 있습니다.

---

## 📄 라이선스 (License)

본 프로젝트는 [MIT License](./LICENSE)를 따릅니다.