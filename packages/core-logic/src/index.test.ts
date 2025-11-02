import { describe, it, expect } from 'vitest';
import { createInitialGameState, getValidMoves, movePiece } from './index';
import type { GameState, Tile } from './types';

describe('CheDuk Core Logic', () => {
  describe('createInitialGameState', () => {
    it('should create a board with the correct initial piece placements', () => {
      const gameState = createInitialGameState();

      // Test a few key pieces to ensure they are in the right place
      expect(gameState.board['0,0']?.piece?.type).toBe('Chief');
      expect(gameState.board['0,0']?.piece?.player).toBe('Blue');

      expect(gameState.board['10,11']?.piece?.type).toBe('Chief');
      expect(gameState.board['10,11']?.piece?.player).toBe('Red');
      
      expect(gameState.board['0,2']?.piece?.type).toBe('Guard');
      expect(gameState.board['0,2']?.piece?.player).toBe('Blue');

      // Test an empty tile
      expect(gameState.board['5,5']?.piece).toBeNull();

      // Test initial game state properties
      expect(gameState.currentPlayer).toBe('Red');
      expect(gameState.turn).toBe(1);
      expect(gameState.infoScores.Red).toBe(0);
      expect(gameState.infoScores.Blue).toBe(0);
    });
  });

      // We will add tests for getValidMoves and movePiece here later
    });
  
    describe('getValidMoves', () => {
      it('should return correct valid moves for a Guard', () => {
        const gameState = createInitialGameState();
        // Blue Guard's initial position is (0,2)
        const guardTile = { q: 0, r: 2 }; 
  
        const validMoves = getValidMoves(gameState.board, guardTile.q, guardTile.r);
  
        // Expected moves for Guard at (0,2) are (1,2) and (0,3).
        // (0,1) is blocked by a friendly piece. Other neighbors are off-board.
        const expectedMoves = [
          { q: 1, r: 2 },
          { q: 0, r: 3 },
        ];
  
        // Use expect.arrayContaining to check for presence regardless of order
        expect(validMoves).toEqual(expect.arrayContaining(expectedMoves));
        expect(validMoves.length).toBe(expectedMoves.length);
      });
    });
