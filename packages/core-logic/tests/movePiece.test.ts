import { describe, expect, it } from "vitest";

import {
  createInitialGameState,
  getValidMoves,
  movePiece,
} from "../src/index";
import type { GameState, HexCoord, PieceType, Player } from "../src/types";
import { toBoardKey } from "../src/types";

const clearBoard = (state: GameState): void => {
  for (const tile of Object.values(state.board)) {
    tile.piece = null;
  }
};

const placePiece = (
  state: GameState,
  coord: HexCoord,
  piece: { id: string; type: PieceType; player: Player },
): void => {
  state.board[toBoardKey(coord)].piece = { ...piece };
};

describe("core-logic movement", () => {
  it("calculates adjacent moves for a Chief on an open board", () => {
    const state = createInitialGameState();
    clearBoard(state);

    const origin = { q: 5, r: 5 } satisfies HexCoord;
    placePiece(state, origin, { id: "B_Chief", type: "Chief", player: "Blue" });

    const moves = getValidMoves(state.board, origin.q, origin.r, state.embassyLocations, state);

    expect(moves).toEqual(
      expect.arrayContaining([
        { q: 6, r: 5 },
        { q: 4, r: 5 },
        { q: 5, r: 4 },
        { q: 6, r: 4 },
        { q: 6, r: 6 },
        { q: 5, r: 6 },
      ]),
    );
    expect(moves).toHaveLength(6);
  });

  it("prevents a piece from moving onto a friendly unit", () => {
    const state = createInitialGameState();
    clearBoard(state);

    const origin = { q: 5, r: 5 } satisfies HexCoord;
    placePiece(state, origin, { id: "R_Guard", type: "Guard", player: "Red" });
    placePiece(state, { q: 6, r: 5 }, { id: "R_Blocker", type: "Spy", player: "Red" });

    const moves = getValidMoves(state.board, origin.q, origin.r, state.embassyLocations, state);

    expect(moves).not.toContainEqual({ q: 6, r: 5 });
  });

  it("captures an opposing piece and records it", () => {
    const state = createInitialGameState();
    clearBoard(state);

    const from = { q: 5, r: 5 } satisfies HexCoord;
    const to = { q: 6, r: 5 } satisfies HexCoord;

    placePiece(state, from, { id: "R_Guard", type: "Guard", player: "Red" });
    placePiece(state, to, { id: "B_Spy", type: "Spy", player: "Blue" });

    state.currentPlayer = "Red";

    const updated = movePiece(state, { from, to });

    expect(updated.board[toBoardKey(from)].piece).toBeNull();
    expect(updated.board[toBoardKey(to)].piece?.type).toBe("Guard");
    expect(updated.capturedPieces.Red).toHaveLength(1);
    expect(updated.capturedPieces.Red[0]?.player).toBe("Blue");
    expect(updated.currentPlayer).toBe("Blue");
  });

  it("awards information when a spy reaches the opposing embassy", () => {
    const state = createInitialGameState();
    clearBoard(state);

    const from = { q: 6, r: 5 } satisfies HexCoord;
    const to = state.embassyLocations.Red;

    placePiece(state, from, { id: "B_Spy", type: "Spy", player: "Blue" });

    state.currentPlayer = "Blue";

    const updated = movePiece(state, { from, to });

    expect(updated.infoScores.Blue).toBe(1);
    expect(updated.currentPlayer).toBe("Red");
  });

  it("allows diplomats to slide until blocked", () => {
    const state = createInitialGameState();
    clearBoard(state);

    const origin = { q: 5, r: 5 } satisfies HexCoord;
    placePiece(state, origin, { id: "B_Diplomat", type: "Diplomat", player: "Blue" });
    placePiece(state, { q: 7, r: 5 }, { id: "B_Blocker", type: "Spy", player: "Blue" });
    placePiece(state, { q: 3, r: 5 }, { id: "R_Target", type: "Spy", player: "Red" });

    const moves = getValidMoves(
      state.board,
      origin.q,
      origin.r,
      state.embassyLocations,
      state,
    );

    expect(moves).toEqual(
      expect.arrayContaining([
        { q: 6, r: 5 },
        { q: 4, r: 5 },
        { q: 3, r: 5 },
      ]),
    );
    expect(moves).not.toContainEqual({ q: 7, r: 5 });
    expect(moves).not.toContainEqual({ q: 2, r: 5 });
  });

  it("requires special envoys to jump and forbids capturing ambassadors", () => {
    const state = createInitialGameState();
    clearBoard(state);

    const origin = { q: 5, r: 5 } satisfies HexCoord;
    placePiece(state, origin, { id: "B_Envoy", type: "SpecialEnvoy", player: "Blue" });
    placePiece(state, { q: 6, r: 5 }, { id: "B_Screen", type: "Spy", player: "Blue" });

    placePiece(state, { q: 7, r: 5 }, { id: "R_Guard", type: "Guard", player: "Red" });
    placePiece(state, { q: 8, r: 5 }, { id: "R_Amb", type: "Ambassador", player: "Red" });

    const moves = getValidMoves(
      state.board,
      origin.q,
      origin.r,
      state.embassyLocations,
      state,
    );

    expect(moves).toContainEqual({ q: 7, r: 5 });
    expect(moves).not.toContainEqual({ q: 8, r: 5 });
    expect(moves).not.toContainEqual({ q: 6, r: 5 });
  });

  it("changes ambassador mobility when stationed at the embassy", () => {
    const state = createInitialGameState();
    clearBoard(state);

    const embassy = state.embassyLocations.Blue;
    placePiece(state, embassy, { id: "B_Amb", type: "Ambassador", player: "Blue" });
    placePiece(state, { q: embassy.q + 1, r: embassy.r - 1 }, {
      id: "B_Block",
      type: "Spy",
      player: "Blue",
    });
    placePiece(state, { q: embassy.q - 2, r: embassy.r - 1 }, {
      id: "R_Target",
      type: "Guard",
      player: "Red",
    });

    const movesAtEmbassy = getValidMoves(
      state.board,
      embassy.q,
      embassy.r,
      state.embassyLocations,
      state,
    );

    expect(movesAtEmbassy).toEqual(
      expect.arrayContaining([
        { q: embassy.q + 1, r: embassy.r - 2 },
        { q: embassy.q, r: embassy.r - 2 },
        { q: embassy.q - 2, r: embassy.r - 1 },
        { q: embassy.q - 2, r: embassy.r + 1 },
      ]),
    );
    expect(movesAtEmbassy).not.toContainEqual({
      q: embassy.q + 1,
      r: embassy.r - 1,
    });

    const fieldPost = { q: embassy.q + 2, r: embassy.r } satisfies HexCoord;
    placePiece(state, fieldPost, { id: "B_Amb_Field", type: "Ambassador", player: "Blue" });

    const fieldMoves = getValidMoves(
      state.board,
      fieldPost.q,
      fieldPost.r,
      state.embassyLocations,
      state,
    );

    expect(fieldMoves).toEqual(
      expect.arrayContaining([
        { q: fieldPost.q + 1, r: fieldPost.r },
        { q: fieldPost.q - 1, r: fieldPost.r },
        { q: fieldPost.q, r: fieldPost.r - 1 },
        { q: fieldPost.q, r: fieldPost.r + 1 },
        { q: fieldPost.q - 1, r: fieldPost.r + 1 },
      ]),
    );
    expect(fieldMoves).not.toContainEqual({
      q: fieldPost.q + 1,
      r: fieldPost.r + 2,
    });
  });
});
