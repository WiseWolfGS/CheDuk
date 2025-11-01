import { useState } from 'react';
import GamePage from './pages/GamePage';
import { createInitialGameState, getValidMoves, movePiece, type GameState, type Tile } from '@cheduk/core-logic';

function App() {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
  const [validMoves, setValidMoves] = useState<{ q: number; r: number }[]>([]);

  const handleTileClick = (tile: Tile) => {
    if (selectedTile) {
      // A piece is already selected, check if the new tile is a valid move
      const isVaildMove = validMoves.some(move => move.q === tile.q && move.r === tile.r);
      if (isVaildMove) {
        const newState = movePiece(gameState, { q: selectedTile.q, r: selectedTile.r }, { q: tile.q, r: tile.r });
        setGameState(newState);
        setSelectedTile(null);
        setValidMoves([]);
      } else {
        // Invalid move or clicked another piece, deselect
        setSelectedTile(null);
        setValidMoves([]);
      }
    } else if (tile.piece && tile.piece.player === gameState.currentPlayer) {
      // No piece is selected, select this one if it belongs to the current player
      setSelectedTile(tile);
      const moves = getValidMoves(gameState.board, tile.q, tile.r);
      setValidMoves(moves);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-800">
      <header className="w-full max-w-7xl mx-auto mb-4">
        <h1 className="text-4xl font-bold text-orange-400">CheDuk (체둑)</h1>
      </header>
      <main className="w-full max-w-7xl mx-auto">
        <GamePage 
          gameState={gameState} 
          selectedTile={selectedTile}
          validMoves={validMoves}
          onTileClick={handleTileClick}
        />
      </main>
    </div>
  );
}

export default App;

