# CheDuk – Modern Abstract Strategy Board Game
A hybrid board game inspired by Chess, Xiangqi, and Go, played on a hexagonal grid with asymmetric territories and dual win conditions.

CheDuk combines **piece-based tactics**, **territory control**, and **information warfare** into a unique modern abstract strategy game.
This repository contains the official web implementation of CheDuk, built with a modular mono-repo architecture.

<p align="right">
English | [한국어](README.md)
</p>

---

## 🌟 Features

- **Hexagonal board mechanics** with pointy-top odd-r coordinates
- **Two win conditions:**
  - Eliminate the opponent’s *Chief*
  - Gather 5 *Spy Information Points*
- **Asymmetric territories** dynamically created from embassy placement
- **Unique units** including Ambassador, Spy, Diplomat, Special Envoy, Guard, Chief
- **Local hot-seat play** (MVP target)
- Modular logic layer designed for future **AI opponents** and **online multiplayer**

---

## 📦 Repository Structure

This project uses a **pnpm workspace mono-repo**.

```
./
├─ cheduk-frontend/ # Vite + React UI
├─ remix-app/ # Planned backend for online multiplayer
├─ packages/
│ ├─ core-logic/ # Game engine (rules, piece movement, actions)
│ └─ geometry-hex/ # Hex grid utilities
└─ docs/ # Rulebook, planning docs, dev logs
```


- **Frontend:** React + TypeScript + Tailwind CSS
- **Core Logic:** TypeScript, pure deterministic game engine
- **Backend (planned):** Node.js, Express, Socket.IO
- **Tooling:** Biome (lint/format), Vitest, Docker

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm
- (Optional) Docker & Docker Compose

### Install Dependencies
```bash
pnpm install
```

### Start Development
This runs both the frontend and backend in dev mode.

```bash
pnpm run dev
```
- Frontend: http://localhost:3000
- Backend (Remix): auto-assigned port (e.g., 5173)

### Production (Docker)
```bash
docker compose up --build
```

---

## 📖 Official Rulebook
The full rules are available here:
- [**체둑(CheDuk) 공식 규칙서 (한국어)**](./docs/rulebooks/CheDuk_Rulebook_KOR.md)
- [**CheDuk Official Rulebook (English)**](./docs/rulebooks/CheDuk_Rulebook_ENG.md)

---

## 🎯 Roadmap (Simplified)

### Phase 1 – MVP (In progress)
- Full implementation of all piece rules
- Local 2-player hot-seat gameplay
- Complete victory/defeat logic
- UI for movement, information gathering, territory display

### Phase 2 – Online Multiplayer
- Socket.IO real-time server
- Game validation on the server
- Matchmaking and game rooms

### Phase 3 – AI & Tooling
- Socket.IO real-time server
- Game validation on the server
- Matchmaking and game rooms

---

## 🤝 Contributing
Contributions are welcome! CheDuk is still early in development, so improvements to rules, logic, UI, docs, and testing are all appreciated.

### Good First Issues
- Improve UI highlights for legal moves
- Write unit tests for movement rules
- Document edge cases in Spy/Embassy interactions
- English translations for docs

### Before Contributing
**Please read:**
1. CONTRIBUTING.md (coming soon)
2. CODE_OF_CONDUCT.md
3. docs/Project_Structure.md

---

## 📜 License
This project is licensed under the MIT License. See [MIT License](./LICENSE) for details.

---

## 🙌 Acknowledgements
CheDuk is an original strategy game developed and balanced through extensive offline testing.
Special thanks to all contributors exploring gameplay design, UI/UX, and engine architecture.