import * as http from 'node:http';
import { Server } from "socket.io";
// Import from core-logic
import {
  createInitialGameState,
  movePiece,
  getValidMoves,
} from "@cheduk/core-logic";
import type { GameState, Tile } from "@cheduk/core-logic";

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
    console.log(`Received game move from ${socket.id}:`, move);

    // 1. Validate the move using core-logic
    const piece = gameState.board[move.from.q][move.from.r];
    if (!piece) {
      socket.emit("invalid move", { error: "No piece at the source tile." });
      return;
    }

    const validMoves = getValidMoves(gameState, move.from);
    const isMoveValid = validMoves.some(
      (validMove) => validMove.q === move.to.q && validMove.r === move.to.r,
    );

    if (isMoveValid) {
      // 2. If valid, update the game state
      const newGameState = movePiece(gameState, move.from, move.to);
      gameState = newGameState; // Update server's state

      // 3. Broadcast the new game state to all clients
      io.emit("game state", gameState);
      console.log("Move was valid. New game state broadcasted.");
    } else {
      // 4. If invalid, notify the sender
      console.log("Move was invalid.");
      socket.emit("invalid move", {
        error: "The attempted move is not valid.",
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
