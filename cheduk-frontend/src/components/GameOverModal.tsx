import { useGameStore } from "../store/gameStore";

const GameOverModal = () => {
  const winner = useGameStore((state) => state.gameState.winner);
  const resetGame = useGameStore((state) => state.resetGame);

  if (!winner) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 text-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-3xl font-bold mb-4">Game Over</h2>
        <p className="text-xl mb-6">
          {winner === "Red" ? "Red Player" : "Blue Player"} Wins!
        </p>
        <button
          onClick={resetGame}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;