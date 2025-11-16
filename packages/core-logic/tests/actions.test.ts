import { describe, expect, it } from "vitest";

import {
  createInitialGameState,
  getValidActions,
  performAction,
} from "../src/index";
import type { GameState, HexCoord, PieceType, Player, GameAction } from "../src/types";
import { toBoardKey } from "../src/types";

const createTestGameState = (): GameState => {
  const board = createInitialGameState().board;
  for (const tile of Object.values(board)) {
    tile.piece = null;
  }

  return {
    board,
    gamePhase: "main",
    currentPlayer: "Blue",
    turn: 1,
    infoScores: { Red: 0, Blue: 0 },
    capturedPieces: { Red: [], Blue: [] },
    unplacedPieces: { Red: [], Blue: [] },
    embassyLocations: { Red: { q: 9, r: 8 }, Blue: { q: 1, r: 2 } },
    embassyFirstCapture: { Red: false, Blue: false },
    territories: { Red: [], Blue: [] },
    infoGatheredTiles: [],
    spiesReadyToReturn: [],
    returningSpies: [],
    mainGameFirstPlayer: "Blue",
    gameOver: false,
    winner: null,
    embassyOccupation: { Red: null, Blue: null },
    embassyRecaptureTurn: { Red: null, Blue: null },
    castlingUsed: { Red: false, Blue: false },
  };
};

const placePiece = (
  state: GameState,
  coord: HexCoord,
  piece: { id: string; type: PieceType; player: Player },
): void => {
  state.board[toBoardKey(coord)].piece = { ...piece };
};

describe("core-logic actions", () => {
  it("calculates adjacent moves for a Chief on an open board", () => {
    const state = createTestGameState();

    const origin = { q: 5, r: 5 } satisfies HexCoord;
    placePiece(state, origin, { id: "B_Chief", type: "Chief", player: "Blue" });

    const actions = getValidActions(state.board, origin.q, origin.r, state.embassyLocations, state);
    const moveActions = actions.filter(a => a.type === 'move');

    // For odd-r, neighbors are (q+1,r), (q-1,r), (q,r-1), (q+1,r-1), (q,r+1), (q+1,r+1)
    // r=5 is odd
    expect(moveActions).toHaveLength(6);
    expect(moveActions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ to: { q: 6, r: 5 } }),
        expect.objectContaining({ to: { q: 4, r: 5 } }),
        expect.objectContaining({ to: { q: 5, r: 4 } }),
        expect.objectContaining({ to: { q: 6, r: 4 } }),
        expect.objectContaining({ to: { q: 5, r: 6 } }),
        expect.objectContaining({ to: { q: 6, r: 6 } }),
      ]),
    );
  });

  it("prevents a piece from moving onto a friendly unit", () => {
    const state = createTestGameState();
    state.currentPlayer = "Red";

    const origin = { q: 5, r: 5 } satisfies HexCoord;
    placePiece(state, origin, { id: "R_Guard", type: "Guard", player: "Red" });
    placePiece(state, { q: 6, r: 5 }, { id: "R_Blocker", type: "Spy", player: "Red" });

    const actions = getValidActions(state.board, origin.q, origin.r, state.embassyLocations, state);
    const moveActions = actions.filter(a => a.type === 'move');

    expect(moveActions).not.toContainEqual(expect.objectContaining({ to: { q: 6, r: 5 } }));
  });

  it("captures an opposing piece and records it", () => {
    const state = createTestGameState();
    state.currentPlayer = "Red";

    const from = { q: 5, r: 5 } satisfies HexCoord;
    const to = { q: 6, r: 5 } satisfies HexCoord;

    placePiece(state, from, { id: "R_Guard", type: "Guard", player: "Red" });
    placePiece(state, to, { id: "B_Spy", type: "Spy", player: "Blue" });

    const moveAction: GameAction = { type: 'move', from, to };

    const updated = performAction(state, moveAction);

    expect(updated.board[toBoardKey(from)].piece).toBeNull();
    expect(updated.board[toBoardKey(to)].piece?.type).toBe("Guard");
    expect(updated.capturedPieces.Red).toHaveLength(1);
    expect(updated.capturedPieces.Red[0]?.id).toBe("B_Spy");
    expect(updated.currentPlayer).toBe("Blue");
  });

  it("awards information when a spy reaches the opposing embassy", () => {
    const state = createTestGameState();
    state.currentPlayer = "Blue";
    state.embassyFirstCapture.Red = false; // Ensure it's the first capture

    const from = { q: 8, r: 8 } satisfies HexCoord;
    const to = state.embassyLocations.Red!;

    placePiece(state, from, { id: "B_Spy", type: "Spy", player: "Blue" });

    const moveAction: GameAction = { type: 'move', from, to };
    const updated = performAction(state, moveAction);

    expect(updated.infoScores.Blue).toBe(1);
    expect(updated.embassyFirstCapture.Red).toBe(true);
    expect(updated.currentPlayer).toBe("Red");
  });

  it("grants information when any piece occupies the opposing embassy", () => {
    const state = createTestGameState();
    state.currentPlayer = "Blue";
    const from = { q: 8, r: 7 } satisfies HexCoord;
    const to = state.embassyLocations.Red!;

    placePiece(state, from, { id: "B_Guard_2", type: "Guard", player: "Blue" });

    const moveAction: GameAction = { type: 'move', from, to };
    const updated = performAction(state, moveAction);

    expect(updated.infoScores.Blue).toBe(1);
    expect(updated.embassyFirstCapture.Red).toBe(true);
  });

  it("allows diplomats to slide until blocked", () => {
    const state = createTestGameState();

    const origin = { q: 5, r: 5 } satisfies HexCoord;
    placePiece(state, origin, { id: "B_Diplomat", type: "Diplomat", player: "Blue" });
    placePiece(state, { q: 7, r: 5 }, { id: "B_Blocker", type: "Spy", player: "Blue" });
    placePiece(state, { q: 3, r: 5 }, { id: "R_Target", type: "Spy", player: "Red" });

    const actions = getValidActions(
      state.board,
      origin.q,
      origin.r,
      state.embassyLocations,
      state,
    );
    const moveActions = actions.filter(a => a.type === 'move');

    expect(moveActions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ to: { q: 6, r: 5 } }),
        expect.objectContaining({ to: { q: 4, r: 5 } }),
        expect.objectContaining({ to: { q: 3, r: 5 } }),
      ]),
    );
    expect(moveActions).not.toContainEqual(expect.objectContaining({ to: { q: 7, r: 5 } }));
    expect(moveActions).not.toContainEqual(expect.objectContaining({ to: { q: 2, r: 5 } }));
  });

  it("requires special envoys to jump and forbids capturing ambassadors", () => {
    const state = createTestGameState();

    const origin = { q: 5, r: 5 } satisfies HexCoord;
    placePiece(state, origin, { id: "B_Envoy", type: "SpecialEnvoy", player: "Blue" });
    placePiece(state, { q: 6, r: 5 }, { id: "B_Screen", type: "Spy", player: "Blue" });

    placePiece(state, { q: 7, r: 5 }, { id: "R_Guard", type: "Guard", player: "Red" });
    placePiece(state, { q: 8, r: 5 }, { id: "R_Amb", type: "Ambassador", player: "Red" });

    const actions = getValidActions(
      state.board,
      origin.q,
      origin.r,
      state.embassyLocations,
      state,
    );
    const moveActions = actions.filter(a => a.type === 'move');

    expect(moveActions).toContainEqual(expect.objectContaining({ to: { q: 7, r: 5 } }));
    expect(moveActions).not.toContainEqual(expect.objectContaining({ to: { q: 8, r: 5 } }));
    expect(moveActions).not.toContainEqual(expect.objectContaining({ to: { q: 6, r: 5 } }));
  });

  it("changes ambassador mobility based on location", () => {
    const state = createTestGameState();

    const embassy = state.embassyLocations.Blue!;
    placePiece(state, embassy, { id: "B_Amb", type: "Ambassador", player: "Blue" });

    // From the embassy, it should move like a knight
    const movesAtEmbassy = getValidActions(state.board, embassy.q, embassy.r, state.embassyLocations, state)
      .filter(a => a.type === 'move');

    expect(movesAtEmbassy.length).toBeGreaterThan(0);
    // A real test would check all knight moves, this is a simplification
    expect(movesAtEmbassy).toContainEqual(expect.objectContaining({ to: { q: 2, r: 1 } }));

    // Away from the embassy, it should move one step adjacently
    const fieldPost = { q: 5, r: 5 } satisfies HexCoord;
    placePiece(state, fieldPost, { id: "B_Amb_Field", type: "Ambassador", player: "Blue" });

    const fieldMoves = getValidActions(state.board, fieldPost.q, fieldPost.r, state.embassyLocations, state)
      .filter(a => a.type === 'move');

    expect(fieldMoves.length).toBe(6);
  });

  it("prevents the Chief from leaving territory before castling", () => {
    const state = createTestGameState();
    state.currentPlayer = "Blue";
    state.territories.Blue = [
      { q: 5, r: 5 },
      { q: 6, r: 5 },
      { q: 5, r: 4 },
    ];

    const chiefPos = { q: 5, r: 5 } satisfies HexCoord;
    placePiece(state, chiefPos, { id: "B_Chief", type: "Chief", player: "Blue" });

    const restrictedActions = getValidActions(
      state.board,
      chiefPos.q,
      chiefPos.r,
      state.embassyLocations,
      state,
    );
    const restrictedMoves = restrictedActions.filter((action) => action.type === "move");
    expect(restrictedMoves).not.toContainEqual(expect.objectContaining({ to: { q: 4, r: 5 } }));
    expect(restrictedMoves).toContainEqual(expect.objectContaining({ to: { q: 6, r: 5 } }));

    state.castlingUsed.Blue = true;
    const freedActions = getValidActions(
      state.board,
      chiefPos.q,
      chiefPos.r,
      state.embassyLocations,
      state,
    );
    const freedMoves = freedActions.filter((action) => action.type === "move");
    expect(freedMoves).toContainEqual(expect.objectContaining({ to: { q: 4, r: 5 } }));
  });

  describe("special rules", () => {
    it("offers a castle action when path is clear", () => {
      const state = createTestGameState();
      state.currentPlayer = "Blue";

      const chief = { q: 2, r: 4 } satisfies HexCoord;
      const diplomat = { q: 6, r: 4 } satisfies HexCoord;
      placePiece(state, chief, { id: "B_Chief", type: "Chief", player: "Blue" });
      placePiece(state, diplomat, { id: "B_Diplomat_2", type: "Diplomat", player: "Blue" });

      const actions = getValidActions(state.board, chief.q, chief.r, state.embassyLocations, state);
      expect(actions).toContainEqual(expect.objectContaining({ type: 'castle', chief, diplomat }));
    });

    it("executes castling, swaps positions, and marks usage", () => {
      const state = createTestGameState();
      state.currentPlayer = "Blue";

      const chief = { q: 2, r: 4 } satisfies HexCoord;
      const diplomat = { q: 6, r: 4 } satisfies HexCoord;
      placePiece(state, chief, { id: "B_Chief", type: "Chief", player: "Blue" });
      placePiece(state, diplomat, { id: "B_Diplomat_2", type: "Diplomat", player: "Blue" });

      const castleAction: GameAction = { type: 'castle', player: 'Blue', chief, diplomat };
      const updated = performAction(state, castleAction);

      expect(updated.board[toBoardKey(chief)].piece?.type).toBe("Diplomat");
      expect(updated.board[toBoardKey(diplomat)].piece?.type).toBe("Chief");
      expect(updated.castlingUsed.Blue).toBe(true);
      expect(updated.currentPlayer).toBe("Red");

      const followupActions = getValidActions(
        updated.board,
        diplomat.q,
        diplomat.r,
        updated.embassyLocations,
        updated,
      );
      expect(followupActions.some(action => action.type === 'castle')).toBe(false);
    });

    it("grants information when castling lands on the opposing embassy", () => {
      const state = createTestGameState();
      state.currentPlayer = "Blue";
      state.embassyLocations.Red = { q: 4, r: 4 };

      const chief = { q: 0, r: 4 } satisfies HexCoord;
      const diplomat = state.embassyLocations.Red!;
      placePiece(state, chief, { id: "B_Chief", type: "Chief", player: "Blue" });
      placePiece(state, diplomat, { id: "B_Diplomat_2", type: "Diplomat", player: "Blue" });

      const castleAction: GameAction = {
        type: 'castle',
        player: 'Blue',
        chief,
        diplomat,
      };

      const updated = performAction(state, castleAction);
      expect(updated.infoScores.Blue).toBe(1);
      expect(updated.embassyFirstCapture.Red).toBe(true);
    });

    it("blocks special envoy jumps through an occupied enemy embassy", () => {
      const state = createTestGameState();
      state.currentPlayer = "Blue";
      state.embassyLocations.Red = { q: 3, r: 5 };
      state.embassyLocations.Blue = { q: 8, r: 2 };

      const envoy = { q: 1, r: 5 } satisfies HexCoord;
      placePiece(state, envoy, { id: "B_Envoy", type: "SpecialEnvoy", player: "Blue" });
      placePiece(state, state.embassyLocations.Red!, { id: "B_Occupier", type: "Guard", player: "Blue" });
      placePiece(state, { q: 5, r: 5 }, { id: "R_Target", type: "Spy", player: "Red" });

      const actions = getValidActions(state.board, envoy.q, envoy.r, state.embassyLocations, state);
      const moveActions = actions.filter(action => action.type === 'move');
      expect(moveActions).not.toContainEqual(expect.objectContaining({ to: { q: 5, r: 5 } }));
    });

  it("offers ambassador resurrection only when the embassy is empty", () => {
    const state = createTestGameState();
    state.currentPlayer = "Blue";
    const blueEmbassy = state.embassyLocations.Blue!;
    const capturedAmbassador = { id: "B_Amb", type: "Ambassador" as PieceType, player: "Blue" as Player };

      state.capturedPieces.Red.push(capturedAmbassador);

      let actions = getValidActions(state.board, 0, 0, state.embassyLocations, state);
      expect(actions).toContainEqual(
        expect.objectContaining({ type: 'resurrect', pieceId: 'B_Amb', to: blueEmbassy }),
      );

      placePiece(state, blueEmbassy, { id: "B_Blocker", type: "Guard", player: "Blue" });
    actions = getValidActions(state.board, 0, 0, state.embassyLocations, state);
    expect(actions).not.toContainEqual(expect.objectContaining({ type: 'resurrect', pieceId: 'B_Amb' }));
  });

  it("revives the ambassador at the embassy and removes it from captured pieces", () => {
    const state = createTestGameState();
    state.currentPlayer = "Blue";
    state.turn = 5;
    const blueEmbassy = state.embassyLocations.Blue!;
    const capturedAmbassador = { id: "B_Amb", type: "Ambassador" as PieceType, player: "Blue" as Player };
    state.capturedPieces.Red.push(capturedAmbassador);
    state.embassyRecaptureTurn.Blue = 2;

    const resurrectAction: GameAction = {
      type: 'resurrect',
      to: blueEmbassy,
      pieceId: 'B_Amb',
    };

    const updated = performAction(state, resurrectAction);
    expect(updated.board[toBoardKey(blueEmbassy)].piece?.id).toBe('B_Amb');
    expect(updated.capturedPieces.Red).toHaveLength(0);
    expect(updated.currentPlayer).toBe('Red');
  });

  it("prevents ambassador resurrection when the embassy is occupied or not yet recaptured", () => {
    const occupiedState = createTestGameState();
    occupiedState.currentPlayer = "Blue";
    const blueEmbassy = occupiedState.embassyLocations.Blue!;
    occupiedState.capturedPieces.Red.push({
      id: "B_Amb",
      type: "Ambassador",
      player: "Blue",
    });

    placePiece(occupiedState, blueEmbassy, { id: "B_Blocker", type: "Guard", player: "Blue" });
    const action: GameAction = {
      type: "resurrect",
      to: blueEmbassy,
      pieceId: "B_Amb",
    };
    const occupiedResult = performAction(occupiedState, action);
    expect(occupiedResult.capturedPieces.Red).toHaveLength(1);
    expect(occupiedResult.board[toBoardKey(blueEmbassy)].piece?.id).toBe("B_Blocker");

    const cooldownState = createTestGameState();
    cooldownState.currentPlayer = "Blue";
    cooldownState.capturedPieces.Red.push({
      id: "B_Amb",
      type: "Ambassador",
      player: "Blue",
    });
    const cooldownEmbassy = cooldownState.embassyLocations.Blue!;
    cooldownState.board[toBoardKey(cooldownEmbassy)].piece = null;
    cooldownState.embassyRecaptureTurn.Blue = cooldownState.turn + 1;

    const cooldownResult = performAction(cooldownState, action);
    expect(cooldownResult.capturedPieces.Red).toHaveLength(1);
    expect(cooldownResult.board[toBoardKey(cooldownEmbassy)].piece).toBeNull();
  });

  it("requires friendly reoccupation before allowing ambassador resurrection", () => {
    let state = createTestGameState();
    const blueEmbassy = state.embassyLocations.Blue!;

    const redGuardStart = { q: blueEmbassy.q, r: blueEmbassy.r + 1 } satisfies HexCoord;
    placePiece(state, redGuardStart, {
      id: "R_Guard_Recapture",
      type: "Guard",
      player: "Red",
    });

    state.currentPlayer = "Red";
    const occupyAction = getValidActions(
      state.board,
      redGuardStart.q,
      redGuardStart.r,
      state.embassyLocations,
      state,
    ).find(
      (action) =>
        action.type === "move" &&
        action.to.q === blueEmbassy.q &&
        action.to.r === blueEmbassy.r,
    )!;
    state = performAction(state, occupyAction);

    expect(state.embassyOccupation.Blue).toBe("Red");
    expect(state.embassyRecaptureTurn.Blue).toBe(-1);

    state.currentPlayer = "Red";
    const leaveAction = getValidActions(
      state.board,
      blueEmbassy.q,
      blueEmbassy.r,
      state.embassyLocations,
      state,
    ).find(
      (action) =>
        action.type === "move" &&
        !(action.to.q === blueEmbassy.q && action.to.r === blueEmbassy.r),
    )!;
    state = performAction(state, leaveAction);
    expect(state.embassyRecaptureTurn.Blue).toBe(-1);

    const blueGuardStart = { q: blueEmbassy.q, r: blueEmbassy.r - 1 } satisfies HexCoord;
    placePiece(state, blueGuardStart, {
      id: "B_Guard_Recapture",
      type: "Guard",
      player: "Blue",
    });

    state.currentPlayer = "Blue";
    const reclaimAction = getValidActions(
      state.board,
      blueGuardStart.q,
      blueGuardStart.r,
      state.embassyLocations,
      state,
    ).find(
      (action) =>
        action.type === "move" &&
        action.to.q === blueEmbassy.q &&
        action.to.r === blueEmbassy.r,
    )!;
    state = performAction(state, reclaimAction);

    expect(state.embassyOccupation.Blue).toBeNull();
    expect(state.embassyRecaptureTurn.Blue).toBe(state.turn);
  });
  });

  describe("Spy special actions", () => {
    it("should generate a gatherInfo action for a spy in enemy territory", () => {
      const state = createTestGameState();
      state.currentPlayer = "Blue";
      // Define Red's territory for this test
      state.territories.Red = [{ q: 8, r: 8 }];

      const spyPos = { q: 8, r: 8 }; // A tile in Red's territory
      placePiece(state, spyPos, { id: "B_Spy_1", type: "Spy", player: "Blue" });

      const actions = getValidActions(state.board, spyPos.q, spyPos.r, state.embassyLocations, state);

      expect(actions).toContainEqual(expect.objectContaining({ type: 'gatherInfo', pieceId: 'B_Spy_1' }));
    });

    it("should not generate gatherInfo if blocked by a guard", () => {
      const state = createTestGameState();
      state.currentPlayer = "Blue";
      state.territories.Red = [{ q: 8, r: 8 }];

      const spyPos = { q: 8, r: 8 };
      const guardPos = { q: 8, r: 7 };
      placePiece(state, spyPos, { id: "B_Spy_1", type: "Spy", player: "Blue" });
      placePiece(state, guardPos, { id: "R_Guard_1", type: "Guard", player: "Red" });

      const actions = getValidActions(state.board, spyPos.q, spyPos.r, state.embassyLocations, state);

      expect(actions).not.toContainEqual(expect.objectContaining({ type: 'gatherInfo' }));
    });

    it("should correctly process a gatherInfo action", () => {
      const state = createTestGameState();
      state.currentPlayer = "Blue";

      const spyPos = { q: 8, r: 8 };
      placePiece(state, spyPos, { id: "B_Spy_1", type: "Spy", player: "Blue" });

      const gatherAction: GameAction = { type: 'gatherInfo', at: spyPos, pieceId: 'B_Spy_1' };
      const updatedState = performAction(state, gatherAction);

      expect(updatedState.infoScores.Blue).toBe(1);
      expect(updatedState.board[toBoardKey(spyPos)].piece).toBeNull();
      expect(updatedState.spiesReadyToReturn).toContain("B_Spy_1");
      expect(updatedState.returningSpies.some(p => p.id === "B_Spy_1")).toBe(true);
      expect(updatedState.currentPlayer).toBe("Red");
    });

    it("should correctly process a return action", () => {
      const state = createTestGameState();
      const spyPiece = { id: "B_Spy_1", type: "Spy" as PieceType, player: "Blue" as Player };
      state.spiesReadyToReturn = ["B_Spy_1"];
      state.returningSpies = [spyPiece];
      state.currentPlayer = "Blue";

      const returnPos = { q: 1, r: 1 }; // A tile in Blue's territory
      const returnAction: GameAction = { type: 'return', to: returnPos, pieceId: 'B_Spy_1' };
      const updatedState = performAction(state, returnAction);

      expect(updatedState.board[toBoardKey(returnPos)].piece).toEqual(spyPiece);
      expect(updatedState.spiesReadyToReturn).not.toContain("B_Spy_1");
      expect(updatedState.returningSpies.some(p => p.id === "B_Spy_1")).toBe(false);
      expect(updatedState.currentPlayer).toBe("Red");
    });
  });
});
