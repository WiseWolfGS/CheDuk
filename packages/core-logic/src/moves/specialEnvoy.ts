import type { HexCoord, Piece, Player } from "../types";
import {
  ALL_DIRECTIONS,
  getTile,
  isEnemy,
  isInsideBoard,
  step,
} from "./utils";
import type { MoveGenerator } from "./types";

const canCapture = (piece: Piece, target: Piece): boolean =>
  isEnemy(piece, target) && target.type !== "Ambassador" && target.type !== "SpecialEnvoy";

const getOpponent = (player: Player): Player => (player === "Red" ? "Blue" : "Red");

export const getSpecialEnvoyMoves: MoveGenerator = ({ board, origin, piece, state }) => {
  const moves: HexCoord[] = [];
  const enemyEmbassy = state.embassyLocations[getOpponent(piece.player)];

  for (const direction of ALL_DIRECTIONS) {
    let scout = origin;
    let jumpedTile: { coord: HexCoord; occupant: Piece } | null = null;

    while (true) {
      scout = step(scout, direction);
      if (!isInsideBoard(board, scout)) break;

      const tile = getTile(board, scout);
      if (!tile) break;

      if (tile.piece) {
        if (
          enemyEmbassy &&
          tile.q === enemyEmbassy.q &&
          tile.r === enemyEmbassy.r &&
          tile.piece.player === piece.player
        ) {
          jumpedTile = null;
          break;
        }

        if (tile.piece.type !== "SpecialEnvoy") {
          jumpedTile = { coord: { ...scout }, occupant: tile.piece };
        }
        break;
      }
    }

    if (!jumpedTile) {
      continue;
    }

    let landing = jumpedTile.coord;

    while (true) {
      landing = step(landing, direction);
      if (!isInsideBoard(board, landing)) break;

      const tile = getTile(board, landing);
      if (!tile) break;

      if (tile.piece) {
        if (tile.piece.player === piece.player) {
          break;
        }

        if (canCapture(piece, tile.piece)) {
          moves.push({ ...landing });
        }
        break;
      }

      moves.push({ ...landing });
    }
  }

  return moves;
};
