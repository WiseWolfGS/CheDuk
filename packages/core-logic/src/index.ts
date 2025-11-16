import { COLS, ROWS } from "@cheduk/geometry-hex";
import {
  isInsideBoard,
  step,
  getTile,
  ALL_DIRECTIONS,
  offsetToCube,
  cubeDistance,
} from "./moves/utils";
import type { HexDirection, CubeCoord } from "./moves/utils";

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

const coordsEqual = (a?: HexCoord, b?: HexCoord): boolean =>
  Boolean(a && b && a.q === b.q && a.r === b.r);

const getOpponent = (player: Player): Player => (player === "Red" ? "Blue" : "Red");

const findAdjacentGuard = (
  board: BoardState,
  chiefCoord: HexCoord,
  chiefPlayer: Player,
): { guardPiece: Piece; guardCoord: HexCoord } | null => {
  for (const dir of ALL_DIRECTIONS) {
    const neighborCoord = step(chiefCoord, dir);
    const neighborTile = getTile(board, neighborCoord);
    if (
      neighborTile?.piece &&
      neighborTile.piece.type === "Guard" &&
      neighborTile.piece.player === chiefPlayer
    ) {
      return { guardPiece: neighborTile.piece, guardCoord: neighborCoord };
    }
  }
  return null;
};

const setPiece = (board: BoardState, coord: HexCoord, piece: Piece): void => {
  const key = toBoardKey(coord);
  if (!board[key]) {
    board[key] = { ...createTile(coord.q, coord.r) };
  }
  board[key].piece = piece;
};

const getTerritories = (
  board: BoardState,
  embassyLocations: Partial<EmbassyMap>,
): Record<Player, HexCoord[]> => {
  const territories: Record<Player, HexCoord[]> = { Red: [], Blue: [] };
  const redEmbassy = embassyLocations.Red;
  const blueEmbassy = embassyLocations.Blue;

  // Blue territory rule
  if (blueEmbassy) {
    const blueDirection = "NE";
    let blueCurrent: HexCoord = blueEmbassy;
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
  }

  // Red territory rule
  if (redEmbassy) {
    const redDirection = "SW";
    let redCurrent: HexCoord = redEmbassy;
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
  }

  return territories;
};

const DIRECTION_CUBE_VECTORS: Record<HexDirection, CubeCoord> = {
  E: { x: 1, y: -1, z: 0 },
  W: { x: -1, y: 1, z: 0 },
  NE: { x: 1, y: 0, z: -1 },
  SW: { x: -1, y: 0, z: 1 },
  NW: { x: 0, y: 1, z: -1 },
  SE: { x: 0, y: -1, z: 1 },
};

const getCastleVector = (
  from: HexCoord,
  to: HexCoord,
): { direction: HexDirection; distance: number } | null => {
  const fromCube = offsetToCube(from);
  const toCube = offsetToCube(to);

  const dx = toCube.x - fromCube.x;
  const dy = toCube.y - fromCube.y;
  const dz = toCube.z - fromCube.z;

  const distance = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dz));
  if (distance === 0) return null;

  for (const direction of ALL_DIRECTIONS) {
    const vector = DIRECTION_CUBE_VECTORS[direction];
    if (
      dx === vector.x * distance &&
      dy === vector.y * distance &&
      dz === vector.z * distance
    ) {
      return { direction, distance };
    }
  }

  return null;
};

const isPathClear = (
  board: BoardState,
  origin: HexCoord,
  direction: HexDirection,
  distance: number,
): boolean => {
  let current = origin;
  for (let steps = 1; steps < distance; steps += 1) {
    current = step(current, direction);
    const tile = getTile(board, current);
    if (!tile || tile.piece) {
      return false;
    }
  }
  return true;
};

const findPieceCoord = (
  board: BoardState,
  predicate: (piece: Piece, tile: Tile) => boolean,
): HexCoord | null => {
  for (const tile of Object.values(board)) {
    if (tile.piece && predicate(tile.piece, tile)) {
      return { q: tile.q, r: tile.r };
    }
  }
  return null;
};

const calculateEmbassyOccupation = (
  board: BoardState,
  embassyLocations: Partial<EmbassyMap>,
): Record<Player, Player | null> => {
  const occupancy: Record<Player, Player | null> = { Red: null, Blue: null };
  for (const player of PLAYERS) {
    const embassy = embassyLocations[player];
    if (!embassy) continue;
    const tile = getTile(board, embassy);
    if (tile?.piece && tile.piece.player !== player) {
      occupancy[player] = tile.piece.player;
    } else {
      occupancy[player] = null;
    }
  }
  return occupancy;
};

const recomputeEmbassyState = (
  prevState: GameState,
  board: BoardState,
  resultingTurn: number,
  actor: Player,
  embassyLocations: Partial<EmbassyMap>,
): {
  embassyOccupation: Record<Player, Player | null>;
  embassyRecaptureTurn: Record<Player, number | null>;
} => {
  const nextOccupation = calculateEmbassyOccupation(board, embassyLocations);
  const nextRecaptureTurn: Record<Player, number | null> = {
    Red: prevState.embassyRecaptureTurn.Red,
    Blue: prevState.embassyRecaptureTurn.Blue,
  };

  for (const owner of PLAYERS) {
    const newOccupant = nextOccupation[owner];
    const prevRecapture = prevState.embassyRecaptureTurn[owner];
    const embassyCoord = embassyLocations[owner];
    const embassyTile = embassyCoord ? getTile(board, embassyCoord) : undefined;
    const friendlyOnEmbassy = embassyTile?.piece?.player === owner;

    if (newOccupant) {
      nextRecaptureTurn[owner] = -1;
    } else if (friendlyOnEmbassy && prevRecapture === -1) {
      nextRecaptureTurn[owner] = resultingTurn;
    } else {
      nextRecaptureTurn[owner] = prevRecapture;
    }
  }

  return { embassyOccupation: nextOccupation, embassyRecaptureTurn: nextRecaptureTurn };
};

const applyEmbassyUpdates = (
  prevState: GameState,
  draftState: GameState,
  board: BoardState,
  actor: Player,
): GameState => {
  const { embassyOccupation, embassyRecaptureTurn } = recomputeEmbassyState(
    prevState,
    board,
    draftState.turn,
    actor,
    draftState.embassyLocations,
  );

  return {
    ...draftState,
    embassyOccupation,
    embassyRecaptureTurn,
  };
};

export const createInitialGameState = (): GameState => {
  const board: BoardState = {};

  for (let r = 0; r < ROWS; r += 1) {
    for (let q = 0; q < COLS; q += 1) {
      board[toBoardKey({ q, r })] = createTile(q, r);
    }
  }

  // Fixed pieces
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

  // Unplaced pieces
  const unplacedPieces: PieceCollection = {
    Red: [
      createPiece("R_Ambassador_1", "Ambassador", "Red"),
      createPiece("R_Spy_1", "Spy", "Red"),
      createPiece("R_Spy_2", "Spy", "Red"),
      createPiece("R_Spy_3", "Spy", "Red"),
      createPiece("R_Spy_4", "Spy", "Red"),
      createPiece("R_Spy_5", "Spy", "Red"),
    ],
    Blue: [
      createPiece("B_Ambassador_1", "Ambassador", "Blue"),
      createPiece("B_Spy_1", "Spy", "Blue"),
      createPiece("B_Spy_2", "Spy", "Blue"),
      createPiece("B_Spy_3", "Spy", "Blue"),
      createPiece("B_Spy_4", "Spy", "Blue"),
      createPiece("B_Spy_5", "Spy", "Blue"),
    ],
  };

  return {
    board,
    gamePhase: "placement-ambassador-red",
    currentPlayer: "Red",
    turn: 0,
    infoScores: { Red: 0, Blue: 0 },
    capturedPieces: { Red: [] as Piece[], Blue: [] as Piece[] },
    unplacedPieces,
    embassyLocations: {},
    embassyFirstCapture: { Red: false, Blue: false },
    territories: { Red: [], Blue: [] },
    infoGatheredTiles: [],
    spiesReadyToReturn: [],
    gameOver: false,
    winner: null,
    returningSpies: [] as Piece[],
    mainGameFirstPlayer: null,
    castlingUsed: { Red: false, Blue: false },
    embassyOccupation: { Red: null, Blue: null },
    embassyRecaptureTurn: { Red: null, Blue: null },
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
  embassyLocations: Partial<EmbassyMap>,
  piece: Piece,
): GameState => {
  const territories = getTerritories(board, embassyLocations);
  const embassyOccupation = calculateEmbassyOccupation(board, embassyLocations);
  return {
    board,
    gamePhase: "main", // Assume main phase for fallback action generation
    currentPlayer: piece.player,
    turn: 0,
    infoScores: { Red: 0, Blue: 0 },
    capturedPieces: { Red: [] as Piece[], Blue: [] as Piece[] },
    unplacedPieces: { Red: [] as Piece[], Blue: [] as Piece[] },
    embassyLocations,
    embassyFirstCapture: { Red: false, Blue: false },
    embassyOccupation,
    embassyRecaptureTurn: { Red: null, Blue: null },
    territories,
    infoGatheredTiles: [],
    spiesReadyToReturn: [],
    gameOver: false,
    winner: null,
    returningSpies: [] as Piece[],
    mainGameFirstPlayer: null,
    castlingUsed: { Red: false, Blue: false },
  };
};

import { AMBASSADOR_PLACEMENT_ZONES, SPY_PLACEMENT_ZONES } from "./placement";

export const getValidActions = (
  board: BoardState,
  q: number,
  r: number,
  embassyLocations: Partial<EmbassyMap>,
  gameState?: GameState,
): GameAction[] => {
  // --- Placement Phase ---
  if (gameState && gameState.gamePhase.startsWith("placement")) {
    const player = gameState.currentPlayer;
    const placementActions: GameAction[] = [];

    switch (gameState.gamePhase) {
      case "placement-ambassador-red":
      case "placement-ambassador-blue": {
        const validTiles = AMBASSADOR_PLACEMENT_ZONES[player];
        for (const tile of validTiles) {
          if (!getTile(board, tile)?.piece) {
            placementActions.push({
              type: "placeAmbassador",
              to: tile,
              player,
            });
          }
        }
        return placementActions;
      }
      case "placement-spy-red":
      case "placement-spy-blue": {
        const unplacedSpies = gameState.unplacedPieces[player].filter(
          (p) => p.type === "Spy",
        );
        if (unplacedSpies.length === 0) return [];

        const pieceToPlace = unplacedSpies[0];
        const validTiles = SPY_PLACEMENT_ZONES[player].filter((zoneTile) =>
          gameState.territories[player].some(
            (territoryTile) =>
              zoneTile.q === territoryTile.q && zoneTile.r === territoryTile.r,
          ),
        );

        for (const tile of validTiles) {
          if (!getTile(board, tile)?.piece) {
            placementActions.push({
              type: "placeSpy",
              to: tile,
              player,
              pieceId: pieceToPlace.id,
            });
          }
        }
        return placementActions;
      }
    }
  }

  const key = toBoardKey({ q, r });
  const tile = board[key];
  const piece = tile?.piece;

  // If no piece is selected, but we have a gameState, we can still generate global actions
  if (!piece && gameState) {
    const player = gameState.currentPlayer;
    const opponent = getOpponent(player);
    const specialActions: GameAction[] = [];

    const capturedSpies = gameState.capturedPieces[opponent].filter(
      (p) => p.type === "Spy" && p.player === player,
    );
    const capturedAmbassador = gameState.capturedPieces[opponent].find(
      (p) => p.type === "Ambassador" && p.player === player,
    );

    if (capturedSpies.length > 0) {
      const emptyTerritoryTiles = gameState.territories[player].filter(
        (tile) => !getTile(gameState.board, tile)?.piece,
      );
      for (const spy of capturedSpies) {
        for (const tile of emptyTerritoryTiles) {
          specialActions.push({
            type: "resurrect",
            to: tile,
            pieceId: spy.id,
          });
        }
      }
    }

    if (capturedAmbassador && gameState.embassyLocations[player]) {
      const embassyCoord = gameState.embassyLocations[player] as HexCoord;
      const embassyTile = getTile(board, embassyCoord);
      const recaptureTurn = gameState.embassyRecaptureTurn[player];
      const canUseRevival =
        recaptureTurn !== -1 &&
        (recaptureTurn === null || gameState.turn > recaptureTurn);
      if (embassyTile && !embassyTile.piece && canUseRevival) {
        specialActions.push({
          type: "resurrect",
          to: embassyCoord,
          pieceId: capturedAmbassador.id,
        });
      }
    }
    return specialActions;
  }

  if (!tile || !piece) return [];

  const state = gameState ?? createFallbackState(board, embassyLocations, piece);

  // Generate move actions
  const generator = MOVE_GENERATORS[piece.type];
  const moveActions: GameAction[] = generator
    ? generator(createMoveGeneratorArgs(board, { q, r }, state, piece))
        .filter((move) => Boolean(board[toBoardKey(move)]))
        .map((move) => ({ type: "move", from: { q, r }, to: move }))
    : [];

  const specialActions: GameAction[] = [];

  if (
    gameState &&
    state.gamePhase === "main" &&
    !state.castlingUsed[piece.player] &&
    piece.player === gameState.currentPlayer &&
    (piece.type === "Chief" || piece.type === "Diplomat")
  ) {
    const partnerType = piece.type === "Chief" ? "Diplomat" : "Chief";
    const partnerCoord = findPieceCoord(state.board, (candidate, _tile) => {
      if (candidate.player !== piece.player) return false;
      return candidate.type === partnerType;
    });

    if (partnerCoord) {
      const vector = getCastleVector({ q, r }, partnerCoord);
      if (vector && isPathClear(state.board, { q, r }, vector.direction, vector.distance)) {
        const chiefCoord = piece.type === "Chief" ? { q, r } : partnerCoord;
        const diplomatCoord = piece.type === "Diplomat" ? { q, r } : partnerCoord;
        specialActions.push({
          type: "castle",
          player: piece.player,
          chief: chiefCoord,
          diplomat: diplomatCoord,
        });
      }
    }
  }

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

      const targetPiece = destinationTile.piece; // The piece at the 'to' coordinate

      let finalUpdatedState: GameState; // Declare a variable to hold the final state

      // --- Guard Protection Logic ---
      if (targetPiece?.type === "Chief" && targetPiece.player === opponent) {
        const guardProtection = findAdjacentGuard(board, to, opponent);

        if (guardProtection) {
          // Guard protection is active!
          const { guardPiece, guardCoord } = guardProtection;

          // 1. Capture the Guard instead of the Chief
          capturedPieces[gameState.currentPlayer].push(guardPiece);
          board[toBoardKey(guardCoord)].piece = null; // Remove Guard from its position

          // 2. Attacking piece (movingPiece) stays at its origin
          //    Chief (targetPiece) stays at its destination ('to')
          //    No change to movingPiece's position or targetPiece's position on board

          finalUpdatedState = {
            board,
            capturedPieces,
            infoScores,
            embassyFirstCapture,
            currentPlayer: opponent,
            turn: gameState.turn + 1,
            gameOver: false,
            winner: null,
            gamePhase: gameState.gamePhase,
            unplacedPieces: gameState.unplacedPieces,
            embassyLocations: gameState.embassyLocations,
            territories: gameState.territories,
            infoGatheredTiles: gameState.infoGatheredTiles,
            spiesReadyToReturn: gameState.spiesReadyToReturn,
            returningSpies: gameState.returningSpies,
            mainGameFirstPlayer: gameState.mainGameFirstPlayer,
            castlingUsed: gameState.castlingUsed,
            embassyOccupation: gameState.embassyOccupation,
            embassyRecaptureTurn: gameState.embassyRecaptureTurn,
          };
          // Skip normal move logic below
        } else {
          // No Guard protection, Chief is captured normally
          capturedPieces[gameState.currentPlayer].push(targetPiece); // Capture Chief
          board[fromKey].piece = null; // Remove movingPiece from origin
          board[toKey].piece = { ...movingPiece }; // Place movingPiece at target

          const tempState: GameState = {
            board,
            capturedPieces,
            infoScores,
            embassyFirstCapture,
            gamePhase: gameState.gamePhase,
            currentPlayer: gameState.currentPlayer,
            turn: gameState.turn,
            unplacedPieces: gameState.unplacedPieces,
            embassyLocations: gameState.embassyLocations,
            territories: gameState.territories,
            infoGatheredTiles: gameState.infoGatheredTiles,
            spiesReadyToReturn: gameState.spiesReadyToReturn,
            returningSpies: gameState.returningSpies,
            mainGameFirstPlayer: gameState.mainGameFirstPlayer,
            gameOver: gameState.gameOver,
            winner: gameState.winner,
            castlingUsed: gameState.castlingUsed,
            embassyOccupation: gameState.embassyOccupation,
            embassyRecaptureTurn: gameState.embassyRecaptureTurn,
          };

          const victory = checkVictory(tempState);
          if (victory.gameOver) {
            finalUpdatedState = {
              ...tempState,
              gameOver: true,
              winner: victory.winner,
            };
          } else {
            finalUpdatedState = {
              ...tempState,
              currentPlayer: opponent,
              turn: gameState.turn + 1,
              gameOver: false,
              winner: null,
            };
          }
        }
      } else {
        // --- Normal Move/Capture Logic (no Chief involved, or Chief not protected) ---
        const captured = targetPiece ? { ...targetPiece } : null;
        if (captured) {
          capturedPieces[gameState.currentPlayer].push(captured);
        }

        board[fromKey].piece = null; // Remove movingPiece from origin
        board[toKey].piece = { ...movingPiece }; // Place movingPiece at target

        // Spy embassy capture bonus
        if (
          to.q === gameState.embassyLocations[opponent]?.q &&
          to.r === gameState.embassyLocations[opponent]?.r &&
          !embassyFirstCapture[opponent]
        ) {
          infoScores[gameState.currentPlayer] += 1;
          embassyFirstCapture[opponent] = true;
        }

        const tempState: GameState = {
          board,
          capturedPieces,
          infoScores,
          embassyFirstCapture,
          gamePhase: gameState.gamePhase,
          currentPlayer: gameState.currentPlayer,
          turn: gameState.turn,
          unplacedPieces: gameState.unplacedPieces,
          embassyLocations: gameState.embassyLocations,
          territories: gameState.territories,
          infoGatheredTiles: gameState.infoGatheredTiles,
          spiesReadyToReturn: gameState.spiesReadyToReturn,
          returningSpies: gameState.returningSpies,
          mainGameFirstPlayer: gameState.mainGameFirstPlayer,
          gameOver: gameState.gameOver,
          winner: gameState.winner,
          castlingUsed: gameState.castlingUsed,
          embassyOccupation: gameState.embassyOccupation,
          embassyRecaptureTurn: gameState.embassyRecaptureTurn,
        };

        const victory = checkVictory(tempState);
        if (victory.gameOver) {
          finalUpdatedState = {
            ...tempState,
            gameOver: true,
            winner: victory.winner,
          };
        } else {
          finalUpdatedState = {
            ...tempState,
            currentPlayer: opponent,
            turn: gameState.turn + 1,
            gameOver: false,
            winner: null,
          };
        }
      }

      return applyEmbassyUpdates(
        gameState,
        finalUpdatedState,
        board,
        gameState.currentPlayer,
      );
    }

    case "castle": {
      const { chief, diplomat, player } = action;
      if (player !== gameState.currentPlayer) return gameState;
      if (gameState.castlingUsed[player]) return gameState;

      const chiefTile = gameState.board[toBoardKey(chief)];
      const diplomatTile = gameState.board[toBoardKey(diplomat)];
      if (!chiefTile?.piece || !diplomatTile?.piece) return gameState;

      if (
        chiefTile.piece.player !== player ||
        diplomatTile.piece.player !== player ||
        chiefTile.piece.type !== "Chief" ||
        diplomatTile.piece.type !== "Diplomat"
      ) {
        return gameState;
      }

      const vector = getCastleVector(chief, diplomat);
      if (!vector) return gameState;
      if (!isPathClear(gameState.board, chief, vector.direction, vector.distance)) {
        return gameState;
      }

      const board = cloneBoard(gameState.board);
      const chiefPiece = { ...chiefTile.piece };
      const diplomatPiece = { ...diplomatTile.piece };

      board[toBoardKey(chief)].piece = diplomatPiece;
      board[toBoardKey(diplomat)].piece = chiefPiece;

      const infoScores = cloneInfoTrack(gameState.infoScores);
      const embassyFirstCapture = { ...gameState.embassyFirstCapture };
      const opponent = getOpponent(player);
      const enemyEmbassy = gameState.embassyLocations[opponent];
      const newChiefCoord = diplomat;
      const newDiplomatCoord = chief;

      if (
        enemyEmbassy &&
        !embassyFirstCapture[opponent] &&
        ((enemyEmbassy.q === newChiefCoord.q && enemyEmbassy.r === newChiefCoord.r) ||
          (enemyEmbassy.q === newDiplomatCoord.q && enemyEmbassy.r === newDiplomatCoord.r))
      ) {
        infoScores[player] += 1;
        embassyFirstCapture[opponent] = true;
      }

      const nextCastlingUsed: Record<Player, boolean> = {
        ...gameState.castlingUsed,
        [player]: true,
      };

      const draftState: GameState = {
        ...gameState,
        board,
        infoScores,
        embassyFirstCapture,
        castlingUsed: nextCastlingUsed,
        currentPlayer: opponent,
        turn: gameState.turn + 1,
      };

      return applyEmbassyUpdates(gameState, draftState, board, player);
    }

    case "placeAmbassador": {
      const { to, player } = action;
      const { unplacedPieces, embassyLocations } = gameState;

      const ambassador = unplacedPieces[player].find(
        (p) => p.type === "Ambassador",
      );
      if (!ambassador) return gameState;

      const nextBoard = cloneBoard(gameState.board);
      setPiece(nextBoard, to, ambassador);

      const nextUnplaced = clonePieceCollection(unplacedPieces);
      nextUnplaced[player] = nextUnplaced[player].filter(
        (p) => p.id !== ambassador.id,
      );

      const nextEmbassyLocations = { ...embassyLocations, [player]: to };

      // Transition to next phase
      if (gameState.gamePhase === "placement-ambassador-red") {
        const draftState: GameState = {
          ...gameState,
          board: nextBoard,
          unplacedPieces: nextUnplaced,
          embassyLocations: nextEmbassyLocations,
          gamePhase: "placement-ambassador-blue",
          currentPlayer: "Blue",
        };
        return applyEmbassyUpdates(gameState, draftState, nextBoard, player);
      } else {
        // Blue has placed, now determine who places spies first
        if (!nextEmbassyLocations.Red || !nextEmbassyLocations.Blue) {
          // This case should not be reachable if placement phases are correct
          return gameState;
        }

        const RED_CENTER_OFFSET = { q: 5, r: 5 };
        const BLUE_CENTER_OFFSET = { q: 5, r: 6 };

        const redCube = offsetToCube(nextEmbassyLocations.Red);
        const blueCube = offsetToCube(nextEmbassyLocations.Blue);

        const redCenterCube = offsetToCube(RED_CENTER_OFFSET);
        const blueCenterCube = offsetToCube(BLUE_CENTER_OFFSET);

        const redDist = cubeDistance(redCube, redCenterCube);
        const blueDist = cubeDistance(blueCube, blueCenterCube);
        
        let mainGameFirstPlayer: Player | null = null;
        let spyPlacementFirstPlayer: Player;

        if (redDist !== blueDist) {
          mainGameFirstPlayer = redDist < blueDist ? "Red" : "Blue";
          spyPlacementFirstPlayer = getOpponent(mainGameFirstPlayer);
        } else {
          // Tie in ambassador distance. Spy placement starts with Blue by default.
          // Final first player will be determined after spy placement.
          spyPlacementFirstPlayer = "Blue";
        }

        const nextTerritories = getTerritories(nextBoard, nextEmbassyLocations);

        const draftState: GameState = {
          ...gameState,
          board: nextBoard,
          unplacedPieces: nextUnplaced,
          embassyLocations: nextEmbassyLocations,
          territories: nextTerritories,
          gamePhase: `placement-spy-${spyPlacementFirstPlayer.toLowerCase() as 'red' | 'blue'}`,
          currentPlayer: spyPlacementFirstPlayer,
          mainGameFirstPlayer,
        };
        return applyEmbassyUpdates(gameState, draftState, nextBoard, player);
      }
    }

    case "placeSpy": {
      const { to, player, pieceId } = action;
      const { unplacedPieces } = gameState;

      const spy = unplacedPieces[player].find((p) => p.id === pieceId);
      if (!spy) return gameState;

      const nextBoard = cloneBoard(gameState.board);
      setPiece(nextBoard, to, spy);

      const nextUnplaced = clonePieceCollection(unplacedPieces);
      nextUnplaced[player] = nextUnplaced[player].filter((p) => p.id !== spy.id);

      const opponent = getOpponent(player);
      const opponentSpiesLeft = nextUnplaced[opponent].filter(p => p.type === 'Spy').length;
      const mySpiesLeft = nextUnplaced[player].filter(p => p.type === 'Spy').length;

      let nextPhase = gameState.gamePhase;
      let nextPlayer = gameState.currentPlayer;

      // Alternate turns as long as the opponent has spies to place.
      if (opponentSpiesLeft > 0) {
        nextPlayer = opponent;
        nextPhase = `placement-spy-${opponent.toLowerCase() as 'red' | 'blue'}`;
      } 
      // If opponent is done but current player is not, current player continues.
      else if (mySpiesLeft > 0) {
        nextPlayer = player;
        nextPhase = `placement-spy-${player.toLowerCase() as 'red' | 'blue'}`;
      } 
      // If both players have no spies left, end placement phase.
      else {
        nextPhase = 'main';
        if (gameState.mainGameFirstPlayer) {
          // First player was already determined by ambassador distance.
          nextPlayer = gameState.mainGameFirstPlayer;
        } else {
          // Ambassador distances were a tie, decide by spy distances.
          const RED_CENTER_CUBE = offsetToCube({ q: 5, r: 5 });
          const BLUE_CENTER_CUBE = offsetToCube({ q: 5, r: 6 });
          let redSpyDistTotal = 0;
          let blueSpyDistTotal = 0;

          for (const tile of Object.values(nextBoard)) { // Use nextBoard
            if (tile.piece?.type === 'Spy') {
              const pieceCube = offsetToCube(tile);
              if (tile.piece.player === 'Red') {
                redSpyDistTotal += cubeDistance(pieceCube, RED_CENTER_CUBE);
              } else {
                blueSpyDistTotal += cubeDistance(pieceCube, BLUE_CENTER_CUBE);
              }
            }
          }
          nextPlayer = blueSpyDistTotal < redSpyDistTotal ? 'Blue' : 'Red';
        }
      }

      const draftState: GameState = {
        // Explicitly construct the new state to prevent lost properties
        board: nextBoard,
        gamePhase: nextPhase,
        currentPlayer: nextPlayer,
        unplacedPieces: nextUnplaced,
        turn: gameState.turn,
        infoScores: gameState.infoScores,
        capturedPieces: gameState.capturedPieces,
        embassyLocations: gameState.embassyLocations,
        embassyFirstCapture: gameState.embassyFirstCapture,
        territories: gameState.territories,
        infoGatheredTiles: gameState.infoGatheredTiles,
        spiesReadyToReturn: gameState.spiesReadyToReturn,
        returningSpies: gameState.returningSpies,
        mainGameFirstPlayer: gameState.mainGameFirstPlayer,
        gameOver: gameState.gameOver,
        winner: gameState.winner,
        castlingUsed: gameState.castlingUsed,
        embassyOccupation: gameState.embassyOccupation,
        embassyRecaptureTurn: gameState.embassyRecaptureTurn,
      };
      return applyEmbassyUpdates(gameState, draftState, nextBoard, player);
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

      const stateWithEmbassy = applyEmbassyUpdates(
        gameState,
        updatedState,
        board,
        player,
      );

      const victory = checkVictory(stateWithEmbassy);
      if (victory.gameOver) {
        return {
          ...stateWithEmbassy,
          gameOver: true,
          winner: victory.winner,
        };
      }

      return {
        ...stateWithEmbassy,
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

      const draftState: GameState = {
        ...gameState,
        board,
        spiesReadyToReturn,
        returningSpies,
        currentPlayer: getOpponent(gameState.currentPlayer),
        turn: gameState.turn + 1,
      };
      return applyEmbassyUpdates(
        gameState,
        draftState,
        board,
        gameState.currentPlayer,
      );
    }

    case "resurrect": {
      const { to, pieceId } = action;
      const player = gameState.currentPlayer;
      const opponent = getOpponent(player);

      const capturedPieceIndex = gameState.capturedPieces[opponent].findIndex(
        (p) => p.id === pieceId,
      );
      if (capturedPieceIndex === -1) return gameState;

      const pieceToResurrect =
        gameState.capturedPieces[opponent][capturedPieceIndex];

      const toKey = toBoardKey(to);
      const destinationTile = gameState.board[toKey];
      if (!destinationTile || destinationTile.piece) {
        return gameState;
      }

      if (pieceToResurrect.type === "Ambassador") {
        const embassyCoord = gameState.embassyLocations[player];
        if (!coordsEqual(embassyCoord ?? null, to)) {
          return gameState;
        }
        if (gameState.embassyOccupation[player]) {
          return gameState;
        }
        const recaptureTurn = gameState.embassyRecaptureTurn[player];
        if (recaptureTurn !== null && gameState.turn <= recaptureTurn) {
          return gameState;
        }
      }

      const board = cloneBoard(gameState.board);
      board[toKey] = { ...board[toKey], piece: pieceToResurrect };

      const capturedPieces = clonePieceCollection(gameState.capturedPieces);
      capturedPieces[opponent].splice(capturedPieceIndex, 1);

      const draftState: GameState = {
        ...gameState,
        board,
        capturedPieces,
        currentPlayer: opponent,
        turn: gameState.turn + 1,
      };
      return applyEmbassyUpdates(gameState, draftState, board, player);
    }

    default:
      return gameState;
  }
};

export const performAction = (gameState: GameState, action: GameAction): GameState => {
  return applyAction(gameState, action);
};
