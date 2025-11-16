# CheDuk 프로젝트에 기여하기

CheDuk 프로젝트에 관심을 가지고 기여해 주셔서 감사합니다! 이 문서는 프로젝트에 원활하게 기여하기 위한 가이드를 제공합니다.

### 🤝 행동 강령 (Code of Conduct)

본 프로젝트에 기여하는 모든 분은 행동 강령 (CODE_OF_CONDUCT.md)을 준수할 것을 동의해야 합니다. 서로를 존중하는 협업 환경을 위해 꼭 읽어주시기 바랍니다.

### 🚀 기여 방법
- 버그 리포트 및 기능 제안
  - 버그를 발견했거나 새로운 아이디어가 있다면 GitHub Issues를 통해 알려주세요.
  - 이슈를 작성하기 전에, 기존에 동일하거나 유사한 내용이 있는지 먼저 검색해 주세요.
  - 이슈 작성 시, 제공되는 템플릿(버그 리포트, 기능 제안)을 사용해 주시면 문제를 더 빨리 파악하고 해결하는 데 큰 도움이 됩니다.

- 코드 기여 (Pull Requests)
  - 새로운 기능을 추가하거나 버그를 수정하는 코드 기여를 환영합니다.
  1. 개발 환경 설정
    Fork & Clone: CheDuk 저장소를 자신의 계정으로 Fork한 후, 로컬 환경으로 Clone합니다.
    ```bash
    git clone [https://github.com/](https://github.com/)<Your-GitHub-ID>/CheDuk.git
    cd CheDuk
    ```
  2. 의존성 설치
    이 프로젝트는 pnpm 워크스페이스를 사용합니다.
    ```bash
    pnpm install
    ```
  3. 개발 서버 실행
    cheduk-frontend와 remix-app을 동시에 실행합니다.
    ```bash
    pnpm run dev
    ```
  4. 변경사항 작업
    새 브랜치 생성: main 브랜치에서 작업하지 마시고, 목적에 맞는 새 브랜치를 생성해 주세요.
    - 예시: 기능 추가
    ```bash
    git checkout -b feat/my-new-feature
    ```
    - 예시: 버그 수정
    ```bash
    git checkout -b fix/issue-number
    ```

- 코드 수정
  - 핵심 게임 로직은 packages/core-logic에 있습니다.
  - UI 및 사용자 상호작용은 cheduk-frontend에 있습니다.

- 커밋 전 확인 사항 **(중요)**
  - 기여한 코드는 프로젝트의 품질 표준을 준수해야 합니다. Pull Request를 제출하기 전에 다음 사항을 로컬에서 확인해 주세요.
  - 코드 포맷팅 및 린트 검사: Biome을 사용하여 코드 스타일을 일관되게 유지합니다.
  ```bash
  pnpm format
  pnpm lint:fix
  ```

- 단위 테스트 통과 **(필수)**
  - packages/core-logic에 변경사항이 있다면, 기존 테스트가 모두 통과해야 하며 새로운 로직에 대한 테스트를 추가하는 것을 권장합니다.
  ```bash
  pnpm --filter @cheduk/core-logic test --run
  ```

- Pull Request 제출
  - 작업한 브랜치를 자신의 Fork 저장소로 Push합니다.
  - GitHub 저장소에서 main 브랜치를 대상으로 Pull Request를 생성합니다.
  - PR 템플릿에 따라 변경한 내용, 관련 이슈 번호 등을 상세히 기재해 주세요.
