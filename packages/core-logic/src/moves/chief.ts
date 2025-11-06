import type { HexCoord } from "../types";
import { ALL_DIRECTIONS, getTile, isEnemy, isInsideBoard, step } from "./utils";
import type { MoveGenerator } from "./types";

export const getChiefMoves: MoveGenerator = ({ board, origin, piece }) => {
  const moves: HexCoord[] = [];

  for (const direction of ALL_DIRECTIONS) {
    const next = step(origin, direction);
    if (!isInsideBoard(board, next)) continue;

    const destination = getTile(board, next);
    if (!destination) continue;
    if (destination.piece && !isEnemy(piece, destination.piece)) continue;

    moves.push(next);
  }

  return moves;
};
