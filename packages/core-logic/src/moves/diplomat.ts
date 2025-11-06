import type { HexCoord } from "../types";
import { ALL_DIRECTIONS, getTile, isEnemy, isInsideBoard, step } from "./utils";
import type { MoveGenerator } from "./types";

export const getDiplomatMoves: MoveGenerator = ({ board, origin, piece }) => {
  const moves: HexCoord[] = [];

  for (const direction of ALL_DIRECTIONS) {
    let current = origin;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      current = step(current, direction);
      if (!isInsideBoard(board, current)) break;

      const destination = getTile(board, current);
      if (!destination) break;

      if (destination.piece) {
        if (isEnemy(piece, destination.piece)) {
          moves.push(current);
        }
        break;
      }

      moves.push(current);
    }
  }

  return moves;
};
