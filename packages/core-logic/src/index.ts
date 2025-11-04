// Import all types from the types file

import { COLS, ROWS } from "@cheduk/geometry-hex";
import type {
  BoardState,
  GameState,
  Piece,
  PieceType,
  Player,
  Tile,
} from "./types";

// Re-export the types so other packages can use them.
export type { GameState, BoardState, Player, Piece, PieceType, Tile };

// Helper to create a piece
const createPiece = (
  id: string,
  type: Piece["type"],
  player: Player,
): Piece => ({ id, type, player });

export const createInitialGameState = (): GameState => {
  const board: BoardState = {};

  // 1. Initialize all tiles as empty
  for (let r = 0; r < ROWS; r++) {
    for (let q = 0; q < COLS; q++) {
      board[`${q},${r}`] = { q, r, piece: null };
    }
  }

  // 2. Place fixed pieces for Blue Player (top-left)
  board["0,2"].piece = createPiece("B_Guard_1", "Guard", "Blue");
  board["0,4"].piece = createPiece("B_Diplomat_1", "Diplomat", "Blue");
  board["0,0"].piece = createPiece("B_Chief_1", "Chief", "Blue");
  board["0,1"].piece = createPiece("B_SpecialEnvoy_1", "SpecialEnvoy", "Blue");
  board["1,0"].piece = createPiece("B_SpecialEnvoy_2", "SpecialEnvoy", "Blue");

  // 3. Place fixed pieces for Red Player (bottom-right)
  board["10,9"].piece = createPiece("R_Guard_1", "Guard", "Red");
  board["10,7"].piece = createPiece("R_Diplomat_1", "Diplomat", "Red");
  board["10,11"].piece = createPiece("R_Chief_1", "Chief", "Red");
  board["9,11"].piece = createPiece("R_SpecialEnvoy_1", "SpecialEnvoy", "Red");
  board["10,10"].piece = createPiece("R_SpecialEnvoy_2", "SpecialEnvoy", "Red");

  // 4. Place player-defined pieces in default locations for now
  board["3,6"].piece = createPiece("B_Ambassador_1", "Ambassador", "Blue");
  board["2,6"].piece = createPiece("B_Spy_1", "Spy", "Blue");
  board["3,5"].piece = createPiece("B_Spy_2", "Spy", "Blue");
  board["4,4"].piece = createPiece("B_Spy_3", "Spy", "Blue");
  board["5,1"].piece = createPiece("B_Spy_4", "Spy", "Blue");
  board["6,0"].piece = createPiece("B_Spy_5", "Spy", "Blue");

  board["7,5"].piece = createPiece("R_Ambassador_1", "Ambassador", "Red");
  board["6,7"].piece = createPiece("R_Spy_1", "Spy", "Red");
  board["7,6"].piece = createPiece("R_Spy_2", "Spy", "Red");
  board["8,5"].piece = createPiece("R_Spy_3", "Spy", "Red");
  board["4,11"].piece = createPiece("R_Spy_4", "Spy", "Red");
  board["5,10"].piece = createPiece("R_Spy_5", "Spy", "Red");

  return {
    board,
    currentPlayer: "Red",
    infoScores: { Red: 0, Blue: 0 },
    capturedPieces: { Red: [], Blue: [] },
    turn: 1,
    embassyLocations: {
      Blue: { q: 3, r: 6 },
      Red: { q: 7, r: 5 },
    },
  };
};

// --- Accurate Hex Grid Movement Logic (Pointy-Top, Odd-R) ---

const DIRECTIONS = {
  E: "E",
  W: "W",
  NE: "NE",
  NW: "NW",
  SE: "SE",
  SW: "SW",
} as const;

type Direction = (typeof DIRECTIONS)[keyof typeof DIRECTIONS];

const ALL_DIRECTIONS = Object.values(DIRECTIONS);

function getNextTileInDirection(
  q: number,
  r: number,
  dir: Direction,
): { q: number; r: number } {
  const isOdd = r % 2 !== 0;
  switch (dir) {
    case DIRECTIONS.E: return { q: q + 1, r };
    case DIRECTIONS.W: return { q: q - 1, r };
    case DIRECTIONS.NE: return isOdd ? { q: q + 1, r: r - 1 } : { q, r: r - 1 };
    case DIRECTIONS.NW: return isOdd ? { q, r: r - 1 } : { q: q - 1, r: r - 1 };
    case DIRECTIONS.SE: return isOdd ? { q: q + 1, r: r + 1 } : { q, r: r + 1 };
    case DIRECTIONS.SW: return isOdd ? { q, r: r + 1 } : { q: q - 1, r: r + 1 };
    default: return { q, r };
  }
}

// Helper to get direction vector for a given angle and row parity (pointy-top, odd-r)
const getDirectionVector = (
  angle: number,
  isOddRow: boolean,
): { dq: number; dr: number } => {
  switch (angle) {
    case 0:
      return { dq: 1, dr: 0 }; // Right
    case 60:
      return isOddRow ? { dq: 1, dr: -1 } : { dq: 0, dr: -1 }; // Up-Right
    case 120:
      return isOddRow ? { dq: 0, dr: -1 } : { dq: -1, dr: -1 }; // Up-Left
    case 180:
      return { dq: -1, dr: 0 }; // Left
    case 240:
      return isOddRow ? { dq: 0, dr: 1 } : { dq: -1, dr: 1 }; // Down-Left
    case 300:
      return isOddRow ? { dq: 1, dr: 1 } : { dq: 0, dr: 1 }; // Down-Right
    default:
      return { dq: 0, dr: 0 }; // Should not happen
  }
};

export const getValidMoves = (
  board: BoardState,
  q: number,
  r: number,
  embassyLocations: GameState["embassyLocations"],
): { q: number; r: number }[] => {
  const tile = board[`${q},${r}`];
  if (!tile || !tile.piece) return [];

  const { piece } = tile;
  let moves: { q: number; r: number }[] = [];
  const isOddRow = r % 2 !== 0;

  switch (piece.type) {
    case "Chief": {
      moves = ALL_DIRECTIONS.map(dir => getNextTileInDirection(q, r, dir));
      break;
    }
    case "Guard": {
      for (const dir of ALL_DIRECTIONS) {
        let currentPos = { q, r };
        for (let i = 0; i < 2; i++) { // 1칸, 2칸 이동을 순차적으로 확인
          currentPos = getNextTileInDirection(currentPos.q, currentPos.r, dir);
          const key = `${currentPos.q},${currentPos.r}`;
          const nextTile = board[key];

          if (!nextTile) {
            // 보드 밖이면 해당 방향 탐색 중단
            break;
          }

          if (nextTile.piece) {
            // 다른 기물이 있으면
            if (nextTile.piece.player !== piece.player) {
              // 적군이면 포획 가능
              moves.push(currentPos);
            }
            // 아군이거나, 적군을 포획한 후에는 더 이상 그 방향으로 진행 불가
            break;
          }

          // 기물이 없는 빈 칸이면 이동 가능
          moves.push(currentPos);
        }
      }
      break;
    }
    case "Diplomat": {
      for (const dir of ALL_DIRECTIONS) {
        let currentPos = { q, r };
        // eslint-disable-next-line no-constant-condition
        while (true) {
          currentPos = getNextTileInDirection(currentPos.q, currentPos.r, dir);
          const key = `${currentPos.q},${currentPos.r}`;
          const nextTile = board[key];

          if (!nextTile) break; // Off board

          if (nextTile.piece) {
            if (nextTile.piece.player !== piece.player) {
              moves.push(currentPos); // Capture
            }
            break; // Blocked
          }
          moves.push(currentPos); // Empty tile
        }
      }
      break;
    }
    case "Spy": {
      const spyAnglesRed = [60, 120, 180, 240];
      const spyAnglesBlue = [0, 60, 240, 300];
      const targetAngles =
        piece.player === "Red" ? spyAnglesRed : spyAnglesBlue;

      moves = targetAngles.map((angle) => {
        const { dq, dr } = getDirectionVector(angle, isOddRow);
        return { q: q + dq, r: r + dr };
      });
      break;
    }
    case "SpecialEnvoy": {
      for (const dir of ALL_DIRECTIONS) {
        let currentPos = { q, r };
        let jumpedOverPiece = false;

        // 1. Find the first piece to jump over
        let jumpFromPos = { q, r };
        let jumpedPieceTile: Tile | null = null;

        while (true) {
          jumpFromPos = getNextTileInDirection(jumpFromPos.q, jumpFromPos.r, dir);
          const key = `${jumpFromPos.q},${jumpFromPos.r}`;
          const tile = board[key];

          if (!tile) break; // Off board

          if (tile.piece) {
            jumpedPieceTile = tile;
            break;
          }
        }

        if (!jumpedPieceTile || jumpedPieceTile.piece?.type === "SpecialEnvoy") {
          continue; // Cannot jump over nothing or another SpecialEnvoy
        }

        // 2. Find valid moves after the jump
        currentPos = { q: jumpedPieceTile.q, r: jumpedPieceTile.r };
        while (true) {
          currentPos = getNextTileInDirection(currentPos.q, currentPos.r, dir);
          const key = `${currentPos.q},${currentPos.r}`;
          const nextTile = board[key];

          if (!nextTile) break; // Off board

          if (nextTile.piece) {
            if (
              nextTile.piece.player !== piece.player &&
              nextTile.piece.type !== "Ambassador" &&
              nextTile.piece.type !== "SpecialEnvoy"
            ) {
              moves.push(currentPos); // Capture non-Ambassador enemy
            }
            break; // Blocked by friendly or enemy piece
          }
          moves.push(currentPos); // Empty tile
        }
      }
      break;
    }
    case "Ambassador": {
      const playerEmbassy = embassyLocations[piece.player];
      const isAtEmbassy = playerEmbassy.q === q && playerEmbassy.r === r;

      if (isAtEmbassy) {
        // If at the embassy, perform a Knight-like jump move
        const relativeOffsets = isOddRow
          ? [
              { dq: 0, dr: -2 },
              { dq: 2, dr: -1 }, { dq: -1, dr: -1 },
              { dq: 2, dr: 1 }, { dq: -1, dr: 1 },
              { dq: 0, dr: 2 },
            ]
          : [
              { dq: 1, dr: -2 }, { dq: 0, dr: -2 },
              { dq: 1, dr: -1 }, { dq: -2, dr: -1 },
              { dq: -2, dr: 1 }, { dq: 1, dr: 1 },
              { dq: 0, dr: 2 },
            ];
        moves = relativeOffsets.map(offset => ({ q: q + offset.dq, r: r + offset.dr }));
      } else {
        // If outside, move 1 step in any direction (like a Chief)
        moves = ALL_DIRECTIONS.map((dir) => getNextTileInDirection(q, r, dir));
      }
      break;
    }
    // Other piece logic will be added here
  }

  // Filter out invalid moves
  return moves.filter((move) => {
    const key = `${move.q},${move.r}`;
    if (!board[key]) return false;
    const destinationPiece = board[key].piece;
    return !destinationPiece || destinationPiece.player !== piece.player;
  });
};

export const movePiece = (
  gameState: GameState,
  from: { q: number; r: number },
  to: { q: number; r: number },
): GameState => {
  const { board, currentPlayer, capturedPieces } = gameState;

  const fromKey = `${from.q},${from.r}`;
  const toKey = `${to.q},${to.r}`;

  const movingPiece = board[fromKey]?.piece;
  if (!movingPiece || movingPiece.player !== currentPlayer) {
    return gameState;
  }

  const newBoard = JSON.parse(JSON.stringify(board));
  const newCapturedPieces = JSON.parse(JSON.stringify(capturedPieces));

  const destinationTile = newBoard[toKey];
  if (destinationTile.piece) {
    newCapturedPieces[currentPlayer].push(destinationTile.piece);
  }

  destinationTile.piece = movingPiece;
  newBoard[fromKey].piece = null;

  return {
    ...gameState,
    board: newBoard,
    capturedPieces: newCapturedPieces,
    currentPlayer: currentPlayer === "Red" ? "Blue" : "Red",
    turn: gameState.turn + 1,
  };
};