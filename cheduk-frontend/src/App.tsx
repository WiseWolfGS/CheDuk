import GamePage from "./pages/GamePage";
import { useGameStore } from "./store/gameStore"; // Import Zustand store

function App() {
  // Use Zustand store to get state and actions
  const gameState = useGameStore((state) => state.gameState);
  const selectedTile = useGameStore((state) => state.selectedTile);
  const validMoves = useGameStore((state) => state.validMoves);
  const handleTileClick = useGameStore((state) => state.handleTileClick);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-800">
      <header className="w-full max-w-7xl mx-auto mb-4">
        <h1 className="text-4xl font-bold text-orange-400">CheDuk (체둑)</h1>
      </header>
      <main className="w-full max-w-7xl mx-auto">
                    <GamePage />      </main>
    </div>
  );
}

export default App;
