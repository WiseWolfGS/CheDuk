import * as http from "node:http";
import type { GameState, Tile } from "@cheduk/core-logic";
// Import from core-logic
import {
  createInitialGameState,
  getValidMoves,
  movePiece,
} from "@cheduk/core-logic";
import { Server } from "socket.io";

const PORT = process.env.PORT || 3001;

// --- Game State Management (In-memory) ---
let gameState: GameState = createInitialGameState();

const httpServer = http.createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Allow all origins for now, refine later
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Send the current game state to the newly connected client
  socket.emit("game state", gameState);

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  // Listen for a 'game move' event
  socket.on("game move", (move: { from: Tile; to: Tile }) => {
    console.log(`[DEBUG] Received 'game move' from ${socket.id}:`, move);

    const pieceOnBoard = gameState.board[`${move.from.q},${move.from.r}`]?.piece;

    // 1. Validate the move using core-logic
    if (!pieceOnBoard) {
      const error = "No piece at the source tile.";
      console.error(`[DEBUG] Invalid move: ${error}`);
      socket.emit("invalid move", { error });
      return;
    }

    if (pieceOnBoard.player !== gameState.currentPlayer) {
      const error = `Not the current player's turn. Current: ${gameState.currentPlayer}`;
      console.error(`[DEBUG] Invalid move: ${error}`);
      socket.emit("invalid move", { error });
      return;
    }

    const validMoves = getValidMoves(
      gameState.board,
      move.from.q,
      move.from.r,
      gameState.embassyLocations,
    );
    const isMoveValid = validMoves.some(
      (validMove) => validMove.q === move.to.q && validMove.r === move.to.r,
    );

    console.log("[DEBUG] Server-side validation:");
    console.log("  - Piece:", pieceOnBoard.type, pieceOnBoard.player);
    console.log("  - Current Player:", gameState.currentPlayer);
    console.log("  - Valid Moves Calculated:", validMoves);
    console.log("  - Is Move Valid:", isMoveValid);

    if (isMoveValid) {
      // 2. If valid, update the game state
      const newGameState = movePiece(gameState, move.from, move.to);
      gameState = newGameState; // Update server's state

      // 3. Broadcast the new game state to all clients
      io.emit("game state", gameState);
      console.log("[DEBUG] Move was valid. New game state broadcasted.");
    } else {
      // 4. If invalid, notify the sender
      const error = "The attempted move is not in the list of valid moves.";
      console.error(`[DEBUG] Invalid move: ${error}`);
      socket.emit("invalid move", {
        error,
      });
    }
  });

  // Add a way to reset the game for testing
  socket.on("reset game", () => {
    console.log("Game reset requested.");
    gameState = createInitialGameState();
    io.emit("game state", gameState);
    console.log("Game has been reset. New state broadcasted.");
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server listening on port ${PORT}`);
});

console.log("Socket.IO server starting...");
