import type { GameState, Tile } from "@cheduk/core-logic";
import { createInitialGameState, getValidMoves } from "@cheduk/core-logic";
import { create } from "zustand";
import { io, type Socket } from "socket.io-client";

interface GameStore {
  gameState: GameState;
  selectedTile: Tile | null;
  validMoves: { q: number; r: number }[];
  socket: Socket | null;

  initSocket: () => void;
  setSelectedTile: (tile: Tile | null) => void;
  setValidMoves: (moves: { q: number; r: number }[]) => void;
  handleTileClick: (clickedTile: Tile) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: createInitialGameState(),
  selectedTile: null,
  validMoves: [],
  socket: null,

  initSocket: () => {
    const socket = io("http://localhost:3001");
    set({ socket });

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("game state", (newGameState: GameState) => {
      set({ gameState: newGameState });
    });

    socket.on("invalid move", (data: { error: string }) => {
      // You can implement a more user-friendly notification system
      alert(`Invalid Move: ${data.error}`);
    });
  },

  setSelectedTile: (tile) => set({ selectedTile: tile }),
  setValidMoves: (moves) => set({ validMoves: moves }),

  handleTileClick: (clickedTile) => {
    const { gameState, selectedTile, socket, setSelectedTile, setValidMoves } =
      get();

    if (selectedTile) {
      // A piece is already selected, try to move it by emitting to server
      const isMoveValid = getValidMoves(
        gameState.board,
        selectedTile.q,
        selectedTile.r,
      ).some((move) => move.q === clickedTile.q && move.r === clickedTile.r);

      if (isMoveValid) {
        socket?.emit("game move", { from: selectedTile, to: clickedTile });
      }
      // Deselect after attempting a move
      setSelectedTile(null);
      setValidMoves([]);
    } else {
      // No piece selected, try to select one
      const pieceAtClickedTile =
        gameState.board[`${clickedTile.q},${clickedTile.r}`]?.piece;
      if (
        pieceAtClickedTile &&
        pieceAtClickedTile.player === gameState.currentPlayer
      ) {
        setSelectedTile(clickedTile);
        // Get valid moves locally for quick UI feedback
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

  resetGame: () => {
    get().socket?.emit("reset game");
  },
}));
