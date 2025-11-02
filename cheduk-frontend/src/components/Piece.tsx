import type { Piece } from "@cheduk/core-logic";

interface PieceProps {
  piece: Piece;
}

const pieceLabelMap: Record<Piece["type"], string> = {
  Chief: "수",
  Diplomat: "외",
  SpecialEnvoy: "특",
  Ambassador: "대",
  Spy: "첩",
  Guard: "경",
};

const PieceComponent = ({ piece }: PieceProps) => {
  const bgColor = piece.player === "Red" ? "bg-red-700" : "bg-blue-700";
  const ringColor = piece.player === "Red" ? "ring-red-400" : "ring-blue-400";

  return (
    <div
      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-lg ring-2 ${bgColor} ${ringColor}`}
    >
      {pieceLabelMap[piece.type]}
    </div>
  );
};

export default PieceComponent;
