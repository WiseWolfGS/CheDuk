import { useGameStore } from "../store/gameStore";
import type { Piece } from "@cheduk/core-logic";

const pieceLabelMap: Record<Piece["type"], string> = {
  Chief: "수",
  Diplomat: "외",
  SpecialEnvoy: "특",
  Ambassador: "대",
  Spy: "첩",
  Guard: "경",
};

const CapturedPiece = ({
  piece,
  onClick,
}: {
  piece: Piece;
  onClick: () => void;
}) => {
  const bgColor = piece.player === "Red" ? "bg-red-700" : "bg-blue-700";
  const ringColor = piece.player === "Red" ? "ring-red-400" : "ring-blue-400";

  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-md text-white shadow-md ring-2 ${bgColor} ${ringColor} hover:ring-4 hover:ring-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400`}
      aria-label={`Resurrect ${piece.type}`}
    >
      {pieceLabelMap[piece.type]}
    </button>
  );
};

const CapturedPieces = () => {
  const gameState = useGameStore((state) => state.gameState);
  const startResurrection = useGameStore((state) => state.startResurrection);

  const { currentPlayer, capturedPieces } = gameState;
  const opponent = currentPlayer === "Red" ? "Blue" : "Red";

  // Pieces the current player can resurrect (captured by the opponent)
  const resurrectablePieces = capturedPieces[opponent];

  const resurrectableSpies = resurrectablePieces.filter(
    (p) => p.type === "Spy",
  );
  const resurrectableAmbassador = resurrectablePieces.find(
    (p) => p.type === "Ambassador",
  );

  if (resurrectablePieces.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h3 className="text-lg font-bold text-white mb-3">부활 가능한 기물</h3>
      <div className="flex flex-wrap gap-2">
        {resurrectableSpies.map((piece) => (
          <CapturedPiece
            key={piece.id}
            piece={piece}
            onClick={() => startResurrection(piece.id)}
          />
        ))}
        {resurrectableAmbassador && (
          <CapturedPiece
            key={resurrectableAmbassador.id}
            piece={resurrectableAmbassador}
            onClick={() => startResurrection(resurrectableAmbassador.id)}
          />
        )}
      </div>
    </div>
  );
};

export default CapturedPieces;
