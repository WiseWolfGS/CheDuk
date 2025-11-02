import type { Player, Piece } from "@cheduk/core-logic"; // Keep Player and Piece types
import { useGameStore } from "../store/gameStore"; // Import Zustand store

const GameInfo = () => {
  // No props needed for game state
  // Get state from Zustand store
  const currentPlayer = useGameStore((state) => state.gameState.currentPlayer);
  const infoScores = useGameStore((state) => state.gameState.infoScores);
  const capturedPieces = useGameStore(
    (state) => state.gameState.capturedPieces,
  );

  const renderPlayerInfo = (player: Player) => {
    const isCurrent = currentPlayer === player;
    const textColor = player === "Red" ? "text-red-400" : "text-blue-400";
    const borderColor = player === "Red" ? "border-red-500" : "border-blue-500";

    return (
      <div
        key={player}
        className={`p-3 rounded-lg border-2 ${isCurrent ? borderColor : "border-transparent"} transition-colors`}
      >
        <h3 className={`text-xl font-bold ${textColor}`}>{player}</h3>
        <p>정보 점수: {infoScores[player]} / 5</p>
        <div className="mt-2">
          <p className="font-semibold">잡은 기물:</p>
          <div className="flex flex-wrap gap-1 mt-1 min-h-[2rem]">
            {capturedPieces[player].length > 0
              ? capturedPieces[player]
                  .map((p: Piece) => p.type.charAt(0))
                  .join(", ")
              : "(없음)"}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full shadow-inner">
      <h2 className="text-2xl font-bold mb-4 border-b border-gray-600 pb-2">
        게임 정보
      </h2>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-orange-300">
          현재 턴:{" "}
          <span
            className={`${currentPlayer === "Red" ? "text-red-400" : "text-blue-400"}`}
          >
            {currentPlayer}
          </span>
        </h3>
      </div>

      <div className="space-y-4">
        {renderPlayerInfo("Red")}
        {renderPlayerInfo("Blue")}
      </div>
    </div>
  );
};
export default GameInfo;
