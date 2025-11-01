import { GameState, Piece, HexCoord, Player, PieceType } from './types';
import { tileCoordinates } from '@cheduk/geometry-hex';

// Helper to convert HexCoord to a string key
const coordToString = (coord: HexCoord): string => `${coord.q},${coord.r}`;

export function createInitialGameState(): GameState {
  const board = new Map<string, Piece>();

  const initialPieces: Omit<Piece, 'id'>[] = [
    // Red Team
    { type: 'Commander', player: 'Red', position: { q: 0, r: 0, s: 0 } },
    { type: 'Guard', player: 'Red', position: { q: 1, r: 0, s: -1 } },
    // Blue Team
    { type: 'Commander', player: 'Blue', position: { q: 10, r: 11, s: -21 } },
    { type: 'Guard', player: 'Blue', position: { q: 9, r: 11, s: -20 } },
    // Add other pieces based on the rulebook...
  ];

  initialPieces.forEach((p, index) => {
    const piece: Piece = {
      ...p,
      id: `${p.player}-${p.type}-${index}`,
    };
    board.set(coordToString(piece.position), piece);
  });

  return {
    board,
    currentPlayer: 'Red',
    turn: 1,
    spyIntel: { Red: 0, Blue: 0 },
    capturedPieces: { Red: [], Blue: [] },
  };
}

// Directions for flat-top hex grid with odd-r offset
const even_r_directions = [
    [+1,  0], [ 0, -1], [-1, -1],
    [-1,  0], [-1, +1], [ 0, +1],
];

const odd_r_directions = [
    [+1,  0], [+1, -1], [ 0, -1],
    [-1,  0], [ 0, +1], [+1, +1],
];

function getNeighbors(coord: HexCoord): HexCoord[] {
    const isOdd = coord.r % 2 !== 0;
    const directions = isOdd ? odd_r_directions : even_r_directions;

    return directions.map(dir => {
        const newQ = coord.q + dir[0];
        const newR = coord.r + dir[1];
        return { q: newQ, r: newR, s: -newQ - newR };
    });
}

export function getValidMoves(gameState: GameState, piece: Piece): HexCoord[] {
  const { board } = gameState;
  const { type, position, player } = piece;
  let moves: HexCoord[] = [];

  switch (type) {
    case 'Commander':
    case 'Guard': {
      moves = getNeighbors(position);
      // **THE FIX**: Filter out moves that are off the board
      moves = moves.filter(move => {
        const key = coordToString(move);
        return key in tileCoordinates;
      });

      // Filter out moves to squares occupied by friendly pieces
      moves = moves.filter(move => {
        const key = coordToString(move);
        const destinationPiece = board.get(key);
        return !destinationPiece || destinationPiece.player !== player;
      });
      break;
    }
    // Other piece logic will be added here
  }

  // Add boundary checks if necessary
  return moves;
}

export function movePiece(gameState: GameState, piece: Piece, newPosition: HexCoord): GameState {
  const newBoard = new Map(gameState.board);
  const oldKey = coordToString(piece.position);

  newBoard.delete(oldKey);

  const updatedPiece = { ...piece, position: newPosition };
  const newKey = coordToString(newPosition);
  newBoard.set(newKey, updatedPiece);

  return {
    ...gameState,
    board: newBoard,
    currentPlayer: gameState.currentPlayer === 'Red' ? 'Blue' : 'Red',
    turn: gameState.turn + 1,
  };
}