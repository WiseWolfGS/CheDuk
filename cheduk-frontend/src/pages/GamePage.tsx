import Board from '../components/Board';
import GameInfo from '../components/GameInfo';
import type { GameState, Tile } from '@cheduk/core-logic';

interface GamePageProps {
  gameState: GameState;
  selectedTile: Tile | null;
  validMoves: { q: number; r: number }[];
  onTileClick: (tile: Tile) => void;
}

const GamePage = ({ gameState, selectedTile, validMoves, onTileClick }: GamePageProps) => {
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