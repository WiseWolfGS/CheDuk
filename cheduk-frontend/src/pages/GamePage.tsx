import Board from '../components/Board';
import PlayerInfo from '../components/PlayerInfo';
import GameLog from '../components/GameLog';
import GameOverModal from '../components/GameOverModal';
import { useGameStore } from '../store/gameStore';

const GamePage = () => {
  const gameOver = useGameStore((state) => state.gameState.gameOver);
  const openSpecialActionModal = useGameStore(
    (state) => state.openSpecialActionModal,
  );
  const specialActionCount = useGameStore(
    (state) => state.globalSpecialActions.length,
  );

  return (
    <div className="relative">
      <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto w-full">
        {/* Left Column: Player 1 (Red) Info */}
        <aside className="md:col-span-1">
          <PlayerInfo player="Red" />
        </aside>

        {/* Center Column: Game Board and Logs */}
        <div className="md:col-span-2 space-y-8">
          <div className="flex justify-center">
            <button
              onClick={openSpecialActionModal}
              disabled={specialActionCount === 0}
              className="rounded bg-purple-600 px-4 py-2 text-white shadow-md transition-transform hover:scale-105 hover:bg-purple-700 disabled:cursor-not-allowed disabled:bg-gray-600"
            >
              특수 행동
            </button>
          </div>
          <div className="w-full mx-auto">
            <Board />
          </div>
          <GameLog />
        </div>

        {/* Right Column: Player 2 (Blue) Info */}
        <aside className="md:col-span-1">
          <PlayerInfo player="Blue" />
        </aside>
      </div>
      {gameOver && <GameOverModal />}
    </div>
  );
};

export default GamePage;
