import type { HexCoord } from "../types";
import { getTile, isEnemy, isInsideBoard, offsetFromAngle } from "./utils";
import type { MoveGenerator } from "./types";

const RED_ANGLES = [60, 120, 180, 240] as const;
const BLUE_ANGLES = [0, 60, 240, 300] as const;

export const getSpyMoves: MoveGenerator = ({ board, origin, piece }) => {
  const isOddRow = origin.r % 2 !== 0;
  const angles = piece.player === "Red" ? RED_ANGLES : BLUE_ANGLES;

  const moves: HexCoord[] = [];

  for (const angle of angles) {
    const offset = offsetFromAngle(angle, isOddRow);
    const destination: HexCoord = { q: origin.q + offset.q, r: origin.r + offset.r };
    if (!isInsideBoard(board, destination)) continue;

    const tile = getTile(board, destination);
    if (!tile) continue;
    if (tile.piece && !isEnemy(piece, tile.piece)) continue;

    moves.push(destination);
  }

  return moves;
};
