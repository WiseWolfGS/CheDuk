import Board from "../components/Board";
import GameInfo from "../components/GameInfo";
import { useGameStore } from "../store/gameStore"; // Import Zustand store

const GamePage = () => {
  // No props needed for game state
  // Use Zustand store to get state and actions
  const gameState = useGameStore((state) => state.gameState);
  const selectedTile = useGameStore((state) => state.selectedTile);
  const validMoves = useGameStore((state) => state.validMoves);
  const onTileClick = useGameStore((state) => state.handleTileClick);

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-grow flex items-center justify-center">
        <Board
          board={gameState.board}
          selectedTile={selectedTile}
          validMoves={validMoves}
          onTileClick={onTileClick}
        />
      </div>
      <div className="w-full lg:w-80 flex-shrink-0">
        <GameInfo
          currentPlayer={gameState.currentPlayer}
          infoScores={gameState.infoScores}
          capturedPieces={gameState.capturedPieces}
        />
      </div>
    </div>
  );
};

export default GamePage;
