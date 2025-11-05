import Board from "../components/Board";
import GameInfo from "../components/GameInfo";
import GameOverModal from "../components/GameOverModal";
import { useGameStore } from "../store/gameStore";

const GamePage = () => {
  const gameOver = useGameStore((state) => state.gameState.gameOver);

  return (
    <div className="relative flex flex-col lg:flex-row gap-8">
      <div className="flex-grow flex items-center justify-center">
        <Board />
      </div>
      <div className="w-full lg:w-80 flex-shrink-0">
        <GameInfo />
      </div>
      {gameOver && <GameOverModal />}
    </div>
  );
};

export default GamePage;