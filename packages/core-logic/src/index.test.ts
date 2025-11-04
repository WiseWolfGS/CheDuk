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
  describe("Guard Moves", () => {
    it("should return correct 1-step and 2-step straight moves on an open path", () => {
      const { board } = createInitialGameState();
      // Blue Guard at (0,2) which is an EVEN row
      const validMoves = getValidMoves(board, 0, 2);

      // From (0,2), valid 1-step and 2-step moves are:
      // E: (1,2), (2,2)
      // SE: (0,3), (1,4)
      // Other directions are blocked by friendly pieces or off-board.
      const expectedMoves = [
        { q: 1, r: 2 }, // 1 step E
        { q: 2, r: 2 }, // 2 steps E
        { q: 0, r: 3 }, // 1 step SE
        { q: 1, r: 4 }, // 2 steps SE
      ];

      expect(validMoves).toEqual(expect.arrayContaining(expectedMoves));
      expect(validMoves.length).toBe(expectedMoves.length);
    });

    it("should be blocked by other pieces and not jump over them", () => {
      const { board } = createInitialGameState();
      // Blue Guard at (0,2)
      // Block the path with other pieces
      board["1,2"].piece = { id: "R_T", type: "Spy", player: "Red" }; // Enemy at 1-step East
      board["0,3"].piece = { id: "B_T", type: "Spy", player: "Blue" }; // Friendly at 1-step SE

      const validMoves = getValidMoves(board, 0, 2);

      // E path: Can move to (1,2) to capture, but cannot jump to (2,2).
      // SE path: Blocked by friendly piece at (0,3), so cannot move to (0,3) or (1,4).
      // Other directions from initial state are already blocked or off-board.
      const expectedMoves = [{ q: 1, r: 2 }]; // Only capture is possible

      expect(validMoves).toEqual(expect.arrayContaining(expectedMoves));
      expect(validMoves.length).toBe(expectedMoves.length);
    });
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

      // Check a few key paths from (5,5) to ensure line-of-sight movement works
      expect(validMoves).toContainEqual({ q: 10, r: 5 }); // E
      expect(validMoves).toContainEqual({ q: 0, r: 5 }); // W
      expect(validMoves).toContainEqual({ q: 7, r: 2 }); // NE (Corrected)
      expect(validMoves).toContainEqual({ q: 4, r: 2 }); // NW (Corrected)
      expect(validMoves).toContainEqual({ q: 7, r: 8 }); // SE (Corrected)
      expect(validMoves).toContainEqual({ q: 4, r: 8 }); // SW (Corrected)
    });

    it("should be blocked by other pieces", () => {
      const { board } = createInitialGameState();
      // Clear the board for a clean test scenario
      for (const key in board) {
        board[key].piece = null;
      }

      // Place pieces for the test scenario
      board["5,5"].piece = { id: "B_D", type: "Diplomat", player: "Blue" }; // Diplomat at (5,5) - ODD row
      board["7,5"].piece = { id: "B_S", type: "Spy", player: "Blue" }; // Friendly piece on the E path
      board["3,5"].piece = { id: "R_S", type: "Spy", player: "Red" }; // Enemy piece on the W path

      const validMoves = getValidMoves(board, 5, 5);

      // Check East path: should contain (6,5) but be blocked by the friendly piece at (7,5)
      expect(validMoves).toContainEqual({ q: 6, r: 5 });
      expect(validMoves).not.toContainEqual({ q: 7, r: 5 });
      expect(validMoves).not.toContainEqual({ q: 8, r: 5 });

      // Check West path: should contain (4,5) and (3,5) (for capture) but not go beyond
      expect(validMoves).toContainEqual({ q: 4, r: 5 });
      expect(validMoves).toContainEqual({ q: 3, r: 5 });
      expect(validMoves).not.toContainEqual({ q: 2, r: 5 });
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
