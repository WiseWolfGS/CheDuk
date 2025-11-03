import { describe, expect, it } from "vitest";
import { createInitialGameState, getValidMoves } from "./index";
import type { BoardState } from "./types";

describe("CheDuk Core Logic", () => {
  describe("createInitialGameState", () => {
    it("should create a board with the correct initial piece placements", () => {
      const gameState = createInitialGameState();
      // Test a few key pieces
      expect(gameState.board["0,0"]?.piece?.type).toBe("Chief");
      expect(gameState.board["10,11"]?.piece?.type).toBe("Chief");
      expect(gameState.board["0,2"]?.piece?.type).toBe("Guard");
    });
  });
});

describe("getValidMoves", () => {
  it("should return correct 2-step straight moves for a Guard", () => {
    const { board } = createInitialGameState();
    // Blue Guard at (0,2) which is an EVEN row
    const validMoves = getValidMoves(board, 0, 2);

    // From (0,2), valid 2-step moves are:
    // E: (2,2)
    // SE: (1,4)
    // Other directions are blocked by friendly pieces or off-board.
    const expectedMoves = [
      { q: 2, r: 2 },
      { q: 1, r: 4 },
    ];

    expect(validMoves).toEqual(expect.arrayContaining(expectedMoves));
    expect(validMoves.length).toBe(expectedMoves.length);
  });

  describe("Diplomat Moves", () => {
    it("should return correct line moves for a Diplomat on an empty board", () => {
      const { board: initialBoard } = createInitialGameState();
      const board: BoardState = JSON.parse(JSON.stringify(initialBoard));

      // Clear the board and place one diplomat
      for (const key in board) {
        board[key].piece = null;
      }
      const diplomat = { id: "B_D", type: "Diplomat", player: "Blue" } as const;
      board["5,5"].piece = diplomat; // ODD row

      const validMoves = getValidMoves(board, 5, 5);

      // Check a few key paths from (5,5)
      expect(validMoves).toContainEqual({ q: 10, r: 5 }); // E
      expect(validMoves).toContainEqual({ q: 0, r: 5 }); // W
      expect(validMoves).toContainEqual({ q: 8, r: 2 }); // NE
      expect(validMoves).toContainEqual({ q: 2, r: 2 }); // NW
      expect(validMoves).toContainEqual({ q: 8, r: 8 }); // SE
      expect(validMoves).toContainEqual({ q: 2, r: 8 }); // SW
      expect(validMoves.length).toBe(47);
    });

    it("should be blocked by friendly pieces", () => {
      const { board } = createInitialGameState();
      // Blue Diplomat at (0,4) - EVEN row
      const validMoves = getValidMoves(board, 0, 4);

      // Path towards East is clear
      expect(validMoves).toContainEqual({ q: 10, r: 4 });
      // Path towards NW is blocked by Chief at (0,0)
      expect(validMoves).not.toContainEqual({ q: 0, r: 0 });
      expect(validMoves).not.toContainEqual({ q: -1, r: -1 });
      // Path towards SW is blocked by Ambassador at (3,6)
      expect(validMoves).toContainEqual({ q: 1, r: 5 });
      expect(validMoves).toContainEqual({ q: 2, r: 6 });
      expect(validMoves).not.toContainEqual({ q: 3, r: 6 });
    });

    it("should be able to capture an enemy piece and stop", () => {
      const { board } = createInitialGameState();
      // Blue Diplomat at (0,4)
      // Place a Red piece at (3,4) in the path
      board["3,4"].piece = { id: "R_T", type: "Spy", player: "Red" };

      const validMoves = getValidMoves(board, 0, 4);

      // Should contain moves up to and including the capture
      expect(validMoves).toContainEqual({ q: 1, r: 4 });
      expect(validMoves).toContainEqual({ q: 2, r: 4 });
      expect(validMoves).toContainEqual({ q: 3, r: 4 }); // The capture
      // Should NOT contain moves beyond the capture
      expect(validMoves).not.toContainEqual({ q: 4, r: 4 });
    });
  });
});
