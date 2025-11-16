import type { HexCoord } from "../types";
import { ALL_DIRECTIONS, getTile, isEnemy, isInsideBoard, step } from "./utils";
import type { MoveGenerator } from "./types";

const isWithinTerritory = (territory: HexCoord[], target: HexCoord): boolean =>
  territory.some((tile) => tile.q === target.q && tile.r === target.r);

export const getChiefMoves: MoveGenerator = ({ board, origin, piece, state }) => {
  const moves: HexCoord[] = [];
  const territory = state.territories[piece.player];
  const restrictToTerritory =
    state.gamePhase === "main" &&
    !state.castlingUsed[piece.player] &&
    territory.length > 0;

  for (const direction of ALL_DIRECTIONS) {
    const next = step(origin, direction);
    if (!isInsideBoard(board, next)) continue;

    const destination = getTile(board, next);
    if (!destination) continue;
    if (destination.piece && !isEnemy(piece, destination.piece)) continue;
    if (restrictToTerritory && !isWithinTerritory(territory, next)) continue;

    moves.push(next);
  }

  return moves;
};
