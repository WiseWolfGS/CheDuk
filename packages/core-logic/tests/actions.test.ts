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
