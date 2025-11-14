import Board from '../components/Board';
import PlayerInfo from '../components/PlayerInfo';
import GameLog from '../components/GameLog';
import GameOverModal from '../components/GameOverModal';
import { useGameStore } from '../store/gameStore';

const GamePage = () => {
  const gameOver = useGameStore((state) => state.gameState.gameOver);

  return (
    <div className="relative">
      <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto w-full">
        {/* Left Column: Player 1 (Red) Info */}
        <aside className="md:col-span-1">
          <PlayerInfo player="Red" />
        </aside>

        {/* Center Column: Game Board and Logs */}
        <div className="md:col-span-2 space-y-8">
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
