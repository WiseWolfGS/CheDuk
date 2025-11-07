import { COLS, ROWS } from "@cheduk/geometry-hex";
import { isInsideBoard, step, getTile, ALL_DIRECTIONS } from "./moves/utils";

import type {
  BoardKey,
  BoardState,
  EmbassyMap,
  GameAction,
  GameState,
  HexCoord,
  InfoScoreTrack,
  Piece,
  PieceCollection,
  PieceType,
  Player,
  Tile,
} from "./types";
import { toBoardKey } from "./types";
import { MOVE_GENERATORS } from "./moves";
import type { MoveGeneratorArgs } from "./moves";

export type {
  GameState,
  BoardState,
  Player,
  Piece,
  PieceType,
  Tile,
  GameAction,
} from "./types";

const PLAYERS: readonly Player[] = ["Red", "Blue"];

const createPiece = (id: string, type: PieceType, player: Player): Piece => ({
  id,
  type,
  player,
});

const createTile = (q: number, r: number): Tile => ({
  q,
  r,
  piece: null,
});

const cloneBoard = (board: BoardState): BoardState => {
  const next: BoardState = {};
  for (const [key, tile] of Object.entries(board)) {
    const boardKey = key as BoardKey;
    next[boardKey] = {
      q: tile.q,
      r: tile.r,
      piece: tile.piece ? { ...tile.piece } : null,
    };
  }
  return next;
};

const clonePieceCollection = (collection: PieceCollection): PieceCollection => ({
  Red: collection.Red.map((piece) => ({ ...piece })),
  Blue: collection.Blue.map((piece) => ({ ...piece })),
});

const cloneInfoTrack = (track: InfoScoreTrack): InfoScoreTrack => ({
  Red: track.Red,
  Blue: track.Blue,
});

const getOpponent = (player: Player): Player => (player === "Red" ? "Blue" : "Red");

const setPiece = (board: BoardState, coord: HexCoord, piece: Piece): void => {
  const key = toBoardKey(coord);
  if (!board[key]) {
    board[key] = { ...createTile(coord.q, coord.r) };
  }
  board[key].piece = piece;
};

const getTerritories = (
  board: BoardState,
  embassyLocations: EmbassyMap,
): Record<Player, HexCoord[]> => {
  const territories: Record<Player, HexCoord[]> = { Red: [], Blue: [] };
  const redEmbassy = embassyLocations.Red;
  const blueEmbassy = embassyLocations.Blue;

  const blueDirection = "NE";
  let blueCurrent: HexCoord = blueEmbassy;
  const redDirection = "SW";
  let redCurrent: HexCoord = redEmbassy;

  // Blue territory rule
  while (true) {
    if (!isInsideBoard(board, blueCurrent)) break;

    const blueDestination = getTile(board, blueCurrent);
    if (!blueDestination) break;

    territories.Blue.push(blueDestination);

    let q = blueDestination.q;
    let r = blueDestination.r;

    while (q > 0) {
      q -= 1;
      territories.Blue.push({ q, r });
    }

    blueCurrent = step(blueCurrent, blueDirection);
  }

  // Red territory rule
  while (true) {
    if (!isInsideBoard(board, redCurrent)) break;

    const redDestination = getTile(board, redCurrent);
    if (!redDestination) break;

    territories.Red.push(redDestination);

    let q = redDestination.q;
    let r = redDestination.r;

    while (q < 11) {
      q += 1;
      territories.Red.push({ q, r });
    }

    redCurrent = step(redCurrent, redDirection);
  }

  return territories;
};

export const createInitialGameState = (): GameState => {
  const board: BoardState = {};

  for (let r = 0; r < ROWS; r += 1) {
    for (let q = 0; q < COLS; q += 1) {
      board[toBoardKey({ q, r })] = createTile(q, r);
    }
  }

  setPiece(board, { q: 0, r: 2 }, createPiece("B_Guard_1", "Guard", "Blue"));
  setPiece(board, { q: 0, r: 4 }, createPiece("B_Diplomat_1", "Diplomat", "Blue"));
  setPiece(board, { q: 0, r: 0 }, createPiece("B_Chief_1", "Chief", "Blue"));
  setPiece(board, { q: 0, r: 1 }, createPiece("B_SpecialEnvoy_1", "SpecialEnvoy", "Blue"));
  setPiece(board, { q: 1, r: 0 }, createPiece("B_SpecialEnvoy_2", "SpecialEnvoy", "Blue"));

  setPiece(board, { q: 10, r: 9 }, createPiece("R_Guard_1", "Guard", "Red"));
  setPiece(board, { q: 10, r: 7 }, createPiece("R_Diplomat_1", "Diplomat", "Red"));
  setPiece(board, { q: 10, r: 11 }, createPiece("R_Chief_1", "Chief", "Red"));
  setPiece(board, { q: 9, r: 11 }, createPiece("R_SpecialEnvoy_1", "SpecialEnvoy", "Red"));
  setPiece(board, { q: 10, r: 10 }, createPiece("R_SpecialEnvoy_2", "SpecialEnvoy", "Red"));

  setPiece(board, { q: 3, r: 6 }, createPiece("B_Ambassador_1", "Ambassador", "Blue"));
  setPiece(board, { q: 2, r: 6 }, createPiece("B_Spy_1", "Spy", "Blue"));
  setPiece(board, { q: 3, r: 5 }, createPiece("B_Spy_2", "Spy", "Blue"));
  setPiece(board, { q: 4, r: 4 }, createPiece("B_Spy_3", "Spy", "Blue"));
  setPiece(board, { q: 5, r: 1 }, createPiece("B_Spy_4", "Spy", "Blue"));
  setPiece(board, { q: 6, r: 0 }, createPiece("B_Spy_5", "Spy", "Blue"));

  setPiece(board, { q: 7, r: 5 }, createPiece("R_Ambassador_1", "Ambassador", "Red"));
  setPiece(board, { q: 6, r: 7 }, createPiece("R_Spy_1", "Spy", "Red"));
  setPiece(board, { q: 7, r: 6 }, createPiece("R_Spy_2", "Spy", "Red"));
  setPiece(board, { q: 8, r: 5 }, createPiece("R_Spy_3", "Spy", "Red"));
  setPiece(board, { q: 4, r: 11 }, createPiece("R_Spy_4", "Spy", "Red"));
  setPiece(board, { q: 5, r: 10 }, createPiece("R_Spy_5", "Spy", "Red"));

  const embassyLocations: EmbassyMap = {
    Blue: { q: 3, r: 6 },
    Red: { q: 7, r: 5 },
  };

  const territories = getTerritories(board, embassyLocations);

  return {
    board,
    currentPlayer: "Red",
    turn: 0,
    infoScores: { Red: 0, Blue: 0 },
    capturedPieces: { Red: [], Blue: [] },
    embassyLocations,
    embassyFirstCapture: { Red: false, Blue: false },
    territories,
    infoGatheredTiles: [],
    spiesReadyToReturn: [],
    gameOver: false,
    winner: null,
    returningSpies: [],
  };
};

const createMoveGeneratorArgs = (
  board: BoardState,
  origin: HexCoord,
  state: GameState,
  piece: Piece,
): MoveGeneratorArgs => ({
  board,
  origin,
  state,
  piece,
});

const createFallbackState = (
  board: BoardState,
  embassyLocations: EmbassyMap,
  piece: Piece,
): GameState => {
  const territories = getTerritories(board, embassyLocations);
  return {
    board,
    currentPlayer: piece.player,
    turn: 0,
    infoScores: { Red: 0, Blue: 0 },
    capturedPieces: { Red: [], Blue: [] },
    embassyLocations,
    embassyFirstCapture: { Red: false, Blue: false },
    territories,
    infoGatheredTiles: [],
    spiesReadyToReturn: [],
    gameOver: false,
    winner: null,
    returningSpies: [],
  };
};

export const getValidActions = (
  board: BoardState,
  q: number,
  r: number,
  embassyLocations: EmbassyMap,
  gameState?: GameState,
): GameAction[] => {
  const key = toBoardKey({ q, r });
  const tile = board[key];
  if (!tile || !tile.piece) return [];

  const piece = tile.piece;
  const state = gameState ?? createFallbackState(board, embassyLocations, piece);

  // Generate move actions
  const generator = MOVE_GENERATORS[piece.type];
  const moveActions: GameAction[] = generator
    ? generator(createMoveGeneratorArgs(board, { q, r }, state, piece))
        .filter((move) => Boolean(board[toBoardKey(move)]))
        .map((move) => ({ type: "move", from: { q, r }, to: move }))
    : [];

  const specialActions: GameAction[] = [];
  if (piece.type === "Spy") {
    const opponent = getOpponent(piece.player);

    // Generate gather info action if not already returning
    const isReadyToReturn = state.spiesReadyToReturn.includes(piece.id);
    if (!isReadyToReturn) {
      const isInEnemyTerritory = state.territories[opponent].some(
        (t) => t.q === q && t.r === r,
      );
      const hasBeenGathered = state.infoGatheredTiles.some(
        (t) => t.q === q && t.r === r,
      );

      const isBlockedByGuard = ALL_DIRECTIONS.some((dir) => {
        const neighbor = step({ q, r }, dir);
        const neighborTile = getTile(state.board, neighbor);
        return (
          neighborTile?.piece?.type === "Guard" &&
          neighborTile.piece.player === opponent
        );
      });

      if (isInEnemyTerritory && !hasBeenGathered && !isBlockedByGuard) {
        specialActions.push({
          type: "gatherInfo",
          at: { q, r },
          pieceId: piece.id,
        });
      }
    }
  }

  return [...moveActions, ...specialActions];
};

export const checkVictory = (
  gameState: GameState,
): { gameOver: boolean; winner: Player | null } => {
  const { capturedPieces, infoScores, currentPlayer } = gameState;

  for (const player of PLAYERS) {
    if (infoScores[player] >= 5) {
      return { gameOver: true, winner: player };
    }
  }

  if (capturedPieces[currentPlayer].some((piece) => piece.type === "Chief")) {
    return { gameOver: true, winner: currentPlayer };
  }

  return { gameOver: false, winner: null };
};

const applyAction = (gameState: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "move": {
      const { from, to } = action;
      const fromKey = toBoardKey(from);
      const toKey = toBoardKey(to);

      const originTile = gameState.board[fromKey];
      const destinationTile = gameState.board[toKey];

      if (!originTile || !originTile.piece || !destinationTile) {
        return gameState;
      }

      const movingPiece = originTile.piece;
      if (movingPiece.player !== gameState.currentPlayer) {
        return gameState;
      }

      const legalActions = getValidActions(
        gameState.board,
        from.q,
        from.r,
        gameState.embassyLocations,
        gameState,
      );

      const isValidAction = legalActions.some((legalAction) => {
        if (legalAction.type !== "move") return false;
        return legalAction.to.q === to.q && legalAction.to.r === to.r;
      });

      if (!isValidAction) {
        return gameState;
      }

      const board = cloneBoard(gameState.board);
      const capturedPieces = clonePieceCollection(gameState.capturedPieces);
      const infoScores = cloneInfoTrack(gameState.infoScores);
      const embassyFirstCapture = { ...gameState.embassyFirstCapture };

      const opponent = getOpponent(gameState.currentPlayer);

      const captured = destinationTile.piece
        ? { ...destinationTile.piece }
        : null;
      if (captured) {
        capturedPieces[gameState.currentPlayer].push(captured);
      }

      board[fromKey] = { ...board[fromKey], piece: null };
      board[toKey] = { ...board[toKey], piece: { ...movingPiece } };

      if (
        movingPiece.type === "Spy" &&
        to.q === gameState.embassyLocations[opponent].q &&
        to.r === gameState.embassyLocations[opponent].r &&
        !embassyFirstCapture[opponent]
      ) {
        infoScores[gameState.currentPlayer] += 1;
        embassyFirstCapture[opponent] = true;
      }

      const updatedState: GameState = {
        ...gameState,
        board,
        capturedPieces,
        infoScores,
        embassyFirstCapture,
      };

      const victory = checkVictory(updatedState);
      if (victory.gameOver) {
        return {
          ...updatedState,
          gameOver: true,
          winner: victory.winner,
        };
      }

      return {
        ...updatedState,
        currentPlayer: opponent,
        turn: gameState.turn + 1,
        gameOver: false,
        winner: null,
      };
    }

    case "gatherInfo": {
      const { at, pieceId } = action;
      const player = gameState.currentPlayer;

      const atKey = toBoardKey(at);
      const pieceToReturn = gameState.board[atKey]?.piece;
      if (!pieceToReturn) return gameState;

      const board = cloneBoard(gameState.board);
      board[atKey] = { ...board[atKey], piece: null };

      const infoScores = cloneInfoTrack(gameState.infoScores);
      infoScores[player] += 1;

      const updatedState: GameState = {
        ...gameState,
        board,
        infoScores,
        infoGatheredTiles: [...gameState.infoGatheredTiles, at],
        spiesReadyToReturn: [...gameState.spiesReadyToReturn, pieceId],
        returningSpies: [...gameState.returningSpies, pieceToReturn],
      };

      const victory = checkVictory(updatedState);
      if (victory.gameOver) {
        return {
          ...updatedState,
          gameOver: true,
          winner: victory.winner,
        };
      }

      return {
        ...updatedState,
        currentPlayer: getOpponent(player),
        turn: gameState.turn + 1,
        gameOver: false,
        winner: null,
      };
    }

    case "return": {
      const { to, pieceId } = action;
      const toKey = toBoardKey(to);

      const pieceToReturn = gameState.returningSpies.find(
        (p) => p.id === pieceId,
      );
      if (!pieceToReturn) return gameState;

      const board = cloneBoard(gameState.board);
      board[toKey] = { ...board[toKey], piece: pieceToReturn };

      const spiesReadyToReturn = gameState.spiesReadyToReturn.filter(
        (id) => id !== pieceId,
      );
      const returningSpies = gameState.returningSpies.filter(
        (p) => p.id !== pieceId,
      );

      return {
        ...gameState,
        board,
        spiesReadyToReturn,
        returningSpies,
        currentPlayer: getOpponent(gameState.currentPlayer),
        turn: gameState.turn + 1,
      };
    }

    default:
      return gameState;
  }
};

export const performAction = (gameState: GameState, action: GameAction): GameState => {
  return applyAction(gameState, action);
};
