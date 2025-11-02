import type { GameState, Tile } from "@cheduk/core-logic";
import {
  createInitialGameState,
  getValidMoves,
  movePiece,
} from "@cheduk/core-logic";
import { create } from "zustand";

interface GameStore {
  gameState: GameState;
  selectedTile: Tile | null;
  validMoves: { q: number; r: number }[];

  setSelectedTile: (tile: Tile | null) => void;
  setValidMoves: (moves: { q: number; r: number }[]) => void;
  handleTileClick: (clickedTile: Tile) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: createInitialGameState(),
  selectedTile: null,
  validMoves: [],

  setSelectedTile: (tile) => set({ selectedTile: tile }),
  setValidMoves: (moves) => set({ validMoves: moves }),

  handleTileClick: (clickedTile) => {
    const { gameState, selectedTile, setSelectedTile, setValidMoves } = get();

    if (selectedTile) {
      // A piece is already selected, try to move it
      const isMoveValid = getValidMoves(
        gameState.board,
        selectedTile.q,
        selectedTile.r,
      ).some((move) => move.q === clickedTile.q && move.r === clickedTile.r);

      if (isMoveValid) {
        // Perform the move
        const newGameState = movePiece(gameState, selectedTile, clickedTile);
        set({ gameState: newGameState, selectedTile: null, validMoves: [] });
      } else {
        // Invalid move, deselect
        setSelectedTile(null);
        setValidMoves([]);
      }
    } else {
      // No piece selected, try to select one
      const pieceAtClickedTile =
        gameState.board[`${clickedTile.q},${clickedTile.r}`]?.piece;
      if (
        pieceAtClickedTile &&
        pieceAtClickedTile.player === gameState.currentPlayer
      ) {
        setSelectedTile(clickedTile);
        const moves = getValidMoves(
          gameState.board,
          clickedTile.q,
          clickedTile.r,
        );
        setValidMoves(moves);
      } else {
        // Clicked on an empty tile or opponent's piece, deselect
        setSelectedTile(null);
        setValidMoves([]);
      }
    }
  },

  resetGame: () =>
    set({
      gameState: createInitialGameState(),
      selectedTile: null,
      validMoves: [],
    }),
}));
