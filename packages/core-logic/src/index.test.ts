import { describe, it, expect, beforeEach } from "vitest";
import {
  createInitialGameState,
  getValidMoves,
  type GameState,
} from "./index";

describe("CheDuk Core Logic", () => {
  let gameState: GameState;

  beforeEach(() => {
    gameState = createInitialGameState();
  });

  describe("createInitialGameState", () => {
    it("should create a board with the correct initial piece placements", () => {
      const { board } = gameState;
      // Check a few key pieces
      expect(board["0,0"].piece?.type).toBe("Chief");
      expect(board["0,0"].piece?.player).toBe("Blue");
      expect(board["10,11"].piece?.type).toBe("Chief");
      expect(board["10,11"].piece?.player).toBe("Red");
      expect(board["3,6"].piece?.type).toBe("Ambassador"); // Blue default
      expect(board["7,5"].piece?.type).toBe("Ambassador"); // Red default
    });
  });

  describe("getValidMoves", () => {
    describe("Guard Moves", () => {
      it("should return correct 1-step and 2-step straight moves on an open path", () => {
        const { board, embassyLocations } = gameState;
        // Place a guard in the center of an empty board
        for (const key in board) board[key].piece = null;
        const q = 5, r = 5;
        board[`${q},${r}`].piece = { id: "B_G", type: "Guard", player: "Blue" };

        const validMoves = getValidMoves(board, q, r, embassyLocations);
        // From (5,5) - odd row
        const expected = [
          { q: 6, r: 5 }, { q: 7, r: 5 }, // E
          { q: 4, r: 5 }, { q: 3, r: 5 }, // W
          { q: 6, r: 4 }, { q: 6, r: 3 }, // NE
          { q: 5, r: 4 }, { q: 4, r: 3 }, // NW
          { q: 6, r: 6 }, { q: 6, r: 7 }, // SE
          { q: 5, r: 6 }, { q: 4, r: 7 }, // SW
        ];
        expect(validMoves).toEqual(expect.arrayContaining(expected));
        expect(validMoves.length).toBe(expected.length);
      });

      it("should be blocked by other pieces and not jump over them", () => {
        const { board, embassyLocations } = gameState;
        for (const key in board) board[key].piece = null;
        board["2,2"].piece = { id: "B_G", type: "Guard", player: "Blue" };
        board["3,2"].piece = { id: "R_S", type: "Spy", player: "Red" }; // Blocker
        board["1,2"].piece = { id: "B_S", type: "Spy", player: "Blue" }; // Blocker

        const validMoves = getValidMoves(board, 2, 2, embassyLocations);
        // From (2,2) - even row
        const expected = [
            { q: 3, r: 2 }, // E, Can capture enemy
            // W
            { q: 2, r: 1 }, { q: 3, r: 0 }, // NE
            { q: 1, r: 1 }, { q: 1, r: 0 }, // NW
            { q: 2, r: 3 }, { q: 3, r: 4 }, // SE
            { q: 1, r: 3 }, { q: 1, r: 4 }, // SW
        ];
        expect(validMoves).toEqual(expect.arrayContaining(expected));
        expect(validMoves.length).toBe(expected.length);
      });

    describe("Diplomat Moves", () => {
        it("should return correct line moves for a Diplomat on an empty board", () => {
            const { board, embassyLocations } = gameState;
            for (const key in board) board[key].piece = null;
            const q = 5, r = 5;
            board[`${q},${r}`].piece = { id: "B_D", type: "Diplomat", player: "Blue" };
            const validMoves = getValidMoves(board, q, r, embassyLocations);
            expect(validMoves.length).toBe(32); // Max moves on empty board
        });

        it("should be blocked by other pieces", () => {
            const { board, embassyLocations } = gameState;
            for (const key in board) board[key].piece = null;
            board["5,5"].piece = { id: "B_D", type: "Diplomat", player: "Blue" };
            board["6,5"].piece = { id: "B_S", type: "Spy", player: "Blue" }; // Friendly blocker
            board["4,5"].piece = { id: "R_S", type: "Spy", player: "Red" }; // Enemy blocker

            const validMoves = getValidMoves(board, 5, 5, embassyLocations);
            expect(validMoves).not.toContainEqual({ q: 7, r: 5 });
            expect(validMoves).toContainEqual({ q: 4, r: 5 }); // Can capture
            expect(validMoves.length).toBe(23); // Recalculated based on blockers
        });

        it("should be able to capture an enemy piece and stop", () => {
            const { board, embassyLocations } = gameState;
            for (const key in board) board[key].piece = null;
            board["5,5"].piece = { id: "B_D", type: "Diplomat", player: "Blue" };
            board["7,5"].piece = { id: "R_S", type: "Spy", player: "Red" };

            const validMoves = getValidMoves(board, 5, 5, embassyLocations);
            expect(validMoves).toContainEqual({ q: 6, r: 5 });
            expect(validMoves).toContainEqual({ q: 7, r: 5 }); // Capture move
            expect(validMoves).not.toContainEqual({ q: 8, r: 5 }); // Should stop after capture
        });
    });

    describe("Spy Moves", () => {
        it("should return correct 1-step moves for a Red Spy", () => {
            const { board, embassyLocations } = gameState;
            const q = 5, r = 5;
            board[`${q},${r}`].piece = { id: "R_S", type: "Spy", player: "Red" };
            const validMoves = getValidMoves(board, q, r, embassyLocations);
            // From (5,5) - odd row. Red moves: 60, 120, 180, 240
            const expected = [
                { q: 6, r: 4 }, // 60
                { q: 5, r: 4 }, // 120
                { q: 4, r: 5 }, // 180
                { q: 5, r: 6 }, // 240
            ];
            expect(validMoves).toEqual(expect.arrayContaining(expected));
            expect(validMoves.length).toBe(expected.length);
        });

        it("should return correct 1-step moves for a Blue Spy", () => {
            const { board, embassyLocations } = gameState;
            const q = 5, r = 5;
            board[`${q},${r}`].piece = { id: "B_S", type: "Spy", player: "Blue" };
            const validMoves = getValidMoves(board, q, r, embassyLocations);
            // From (5,5) - odd row. Blue moves: 0, 60, 240, 300
            const expected = [
                { q: 6, r: 5 }, // 0
                { q: 6, r: 4 }, // 60
                { q: 5, r: 6 }, // 240
                { q: 6, r: 6 }, // 300
            ];
            expect(validMoves).toEqual(expect.arrayContaining(expected));
            expect(validMoves.length).toBe(expected.length);
        });
    });

    describe("SpecialEnvoy Moves", () => {
        it("should jump over a piece to any empty tile in a line", () => {
            const { board, embassyLocations } = gameState;
            for (const key in board) board[key].piece = null;
            board["5,5"].piece = { id: "B_SE", type: "SpecialEnvoy", player: "Blue" };
            board["6,5"].piece = { id: "R_S", type: "Spy", player: "Red" }; // Jumpable

            const validMoves = getValidMoves(board, 5, 5, embassyLocations);
            const expected = [
                { q: 7, r: 5 }, { q: 8, r: 5 }, { q: 9, r: 5 }, { q: 10, r: 5 }
            ];
            expect(validMoves).toEqual(expect.arrayContaining(expected));
        });

        it("should capture an enemy by jumping", () => {
            const { board, embassyLocations } = gameState;
            for (const key in board) board[key].piece = null;
            board["5,5"].piece = { id: "B_SE", type: "SpecialEnvoy", player: "Blue" };
            board["6,5"].piece = { id: "R_S1", type: "Spy", player: "Red" }; // Jumpable
            board["7,5"].piece = { id: "R_S2", type: "Spy", player: "Red" }; // Capturable

            const validMoves = getValidMoves(board, 5, 5, embassyLocations);
            expect(validMoves).toContainEqual({ q: 7, r: 5 });
            expect(validMoves).not.toContainEqual({ q: 8, r: 5 }); // Should stop
        });

        it("should not jump over another SpecialEnvoy", () => {
            const { board, embassyLocations } = gameState;
            for (const key in board) board[key].piece = null;
            board["5,5"].piece = { id: "B_SE1", type: "SpecialEnvoy", player: "Blue" };
            board["6,5"].piece = { id: "R_SE2", type: "SpecialEnvoy", player: "Red" };

            const validMoves = getValidMoves(board, 5, 5, embassyLocations);
            expect(validMoves.length).toBe(0);
        });

        it("should not capture an Ambassador", () => {
            const { board, embassyLocations } = gameState;
            for (const key in board) board[key].piece = null;
            board["5,5"].piece = { id: "B_SE", type: "SpecialEnvoy", player: "Blue" };
            board["6,5"].piece = { id: "R_S", type: "Spy", player: "Red" };
            board["7,5"].piece = { id: "R_A", type: "Ambassador", player: "Red" };

            const validMoves = getValidMoves(board, 5, 5, embassyLocations);
            expect(validMoves).not.toContainEqual({ q: 7, r: 5 });
        });

        it("should not capture another SpecialEnvoy", () => {
            const { board, embassyLocations } = gameState;
            for (const key in board) board[key].piece = null;
            board["5,5"].piece = { id: "B_SE1", type: "SpecialEnvoy", player: "Blue" };
            board["6,5"].piece = { id: "R_S", type: "Spy", player: "Red" };
            board["7,5"].piece = { id: "R_SE2", type: "SpecialEnvoy", player: "Red" };

            const validMoves = getValidMoves(board, 5, 5, embassyLocations);
            expect(validMoves).not.toContainEqual({ q: 7, r: 5 });
        });
    });

    describe("Ambassador Moves", () => {
    it("should perform a knight-like jump when at the embassy", () => {
      const { board, embassyLocations } = gameState;
      // Ambassador is at its embassy { q: 3, r: 6 } by default for Blue
      const startPos = embassyLocations.Blue;

      const validMoves = getValidMoves(
        board,
        startPos.q,
        startPos.r,
        embassyLocations,
      );

      // From (3,6) which is an EVEN row, it should have 7 possible moves,
      // but one ({q: 4, r: 4}) is blocked by a friendly spy.
      const expectedMoves = [
        { q: 3, r: 4 },
        { q: 4, r: 5 },
        { q: 1, r: 5 },
        { q: 1, r: 7 },
        { q: 4, r: 7 },
        { q: 3, r: 8 },
      ];

      expect(validMoves).toEqual(expect.arrayContaining(expectedMoves));
      expect(validMoves.length).toBe(expectedMoves.length);
    });

        it("should move 1 step in any direction when outside the embassy", () => {
            const { board, embassyLocations } = gameState;
            // Place ambassador at a non-embassy location, clear the board for simplicity
            for (const key in board) {
                board[key].piece = null;
            }
            const startPos = { q: 5, r: 5 };
            board[`${startPos.q},${startPos.r}`].piece = {
                id: "B_A",
                type: "Ambassador",
                player: "Blue",
            };

            const validMoves = getValidMoves(
                board,
                startPos.q,
                startPos.r,
                embassyLocations,
            );

            // From (5,5) which is an ODD row, it should move like a Chief
            const expectedMoves = [
                { q: 6, r: 5 }, // E
                { q: 4, r: 5 }, // W
                { q: 6, r: 4 }, // NE
                { q: 5, r: 4 }, // NW
                { q: 6, r: 6 }, // SE
                { q: 5, r: 6 }, // SW
            ];

            expect(validMoves).toEqual(expect.arrayContaining(expectedMoves));
            expect(validMoves.length).toBe(expectedMoves.length);
        });
    });
  });
})});