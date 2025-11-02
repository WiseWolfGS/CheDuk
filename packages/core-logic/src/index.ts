// Import all types from the types file
import { GameState, BoardState, Player, Piece, PieceType, Tile } from "./types";
import { COLS, ROWS } from "@cheduk/geometry-hex";

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
  };
};

const getNeighbors = (q: number, r: number): { q: number; r: number }[] => {
  const isOddRow = r % 2 !== 0;
  const directions = [
    // Common directions
    { q: 1, r: 0 },
    { q: -1, r: 0 },
    { q: 0, r: 1 },
    { q: 0, r: -1 },
    // Directions that change based on row parity for pointy-top, odd-r layout
    isOddRow ? { q: 1, r: 1 } : { q: -1, r: 1 },
    isOddRow ? { q: 1, r: -1 } : { q: -1, r: -1 },
  ];

  return directions.map((dir) => ({ q: q + dir.q, r: r + dir.r }));
};

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
): { q: number; r: number }[] => {
  const tile = board[`${q},${r}`];
  if (!tile || !tile.piece) return [];

  const { piece } = tile;
  let moves: { q: number; r: number }[] = [];
  const isOddRow = r % 2 !== 0;

  switch (piece.type) {
    case "Chief":
    case "Guard": {
      moves = getNeighbors(q, r);
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
    // Other piece logic will be added here
  }

  // Filter out invalid moves
  return moves.filter((move) => {
    const key = `${move.q},${move.r}`;
    // Check if the tile exists on the board
    if (!board[key]) return false;
    // Check if the tile is occupied by a friendly piece
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
    // Trying to move an empty tile or opponent's piece
    return gameState;
  }

  // Deep copy of the board to avoid mutation
  const newBoard = JSON.parse(JSON.stringify(board));
  const newCapturedPieces = JSON.parse(JSON.stringify(capturedPieces));

  const destinationTile = newBoard[toKey];
  if (destinationTile.piece) {
    newCapturedPieces[currentPlayer].push(destinationTile.piece);
  }

  // Move the piece
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
