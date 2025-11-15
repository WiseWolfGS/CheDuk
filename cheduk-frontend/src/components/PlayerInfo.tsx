import React from "react";
import type { GameState, Piece, Player } from "@cheduk/core-logic";
import { useGameStore } from "../store/gameStore";

interface PlayerInfoProps {
  player: Player;
}

const getPlacementInstruction = (
  gamePhase: GameState["gamePhase"],
  player: Player,
): string | null => {
  switch (gamePhase) {
    case "placement-ambassador-red":
      return player === "Red" ? "대사를 배치하세요." : "상대방의 대사 배치를 기다리는 중...";
    case "placement-ambassador-blue":
      return player === "Blue" ? "대사를 배치하세요." : "상대방의 대사 배치를 기다리는 중...";
    case "placement-spy-red":
      return player === "Red" ? "첩자를 배치하세요." : "상대방의 첩자 배치를 기다리는 중...";
    case "placement-spy-blue":
      return player === "Blue" ? "첩자를 배치하세요." : "상대방의 첩자 배치를 기다리는 중...";
    default:
      return null;
  }
};

const PlayerInfo: React.FC<PlayerInfoProps> = ({ player }) => {
  const { gameState } = useGameStore();
  const {
    currentPlayer,
    infoScores,
    capturedPieces,
    gamePhase,
    unplacedPieces,
  } = gameState;

  const isCurrentTurn = currentPlayer === player;
  const playerName =
    player === "Red" ? "내 정보 (Red)" : "상대방 정보 (Blue)";
  const infoScore = infoScores[player];
  const myCapturedPieces = capturedPieces[player];

  const borderColor = isCurrentTurn
    ? "border-orange-400"
    : "border-transparent";
  const textColor = isCurrentTurn ? "text-orange-300" : "text-white";

  const instruction = getPlacementInstruction(gamePhase, player);
  const myUnplacedPieces = unplacedPieces[player];

  return (
    <div
      className={`bg-gray-900 bg-opacity-50 p-6 rounded-lg h-full min-h-[200px] border-2 ${borderColor} transition-all duration-300`}
    >
      <h2
        className={`text-2xl font-bold mb-4 pb-2 border-b border-gray-700 ${textColor}`}
      >
        {playerName}
      </h2>

      {instruction && isCurrentTurn ? (
        <div className="space-y-4">
          <p className="text-lg text-yellow-300 animate-pulse">{instruction}</p>
          <div>
            <p className="text-lg">배치할 기물:</p>
            <div className="mt-1 min-h-[48px] text-gray-400">
              {myUnplacedPieces.length > 0
                ? myUnplacedPieces.map((piece: Piece) => piece.type).join(", ")
                : "(없음)"}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-lg">첩보 점수: {infoScore}/5</p>
          <div>
            <p className="text-lg">잡은 기물:</p>
            <div className="mt-1 min-h-[48px] text-gray-400">
              {myCapturedPieces.length > 0
                ? myCapturedPieces.map((piece: Piece) => piece.type).join(", ")
                : "(없음)"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerInfo;
