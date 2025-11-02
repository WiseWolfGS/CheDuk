import Board from '../components/Board';
import GameInfo from '../components/GameInfo';

const GamePage = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-grow flex items-center justify-center">
        <Board />
      </div>
      <div className="w-full lg:w-80 flex-shrink-0">
        <GameInfo />
      </div>
    </div>
  );
};

export default GamePage;