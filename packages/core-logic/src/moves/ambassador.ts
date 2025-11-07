import type { HexCoord } from "../types";
import { ALL_DIRECTIONS, getTile, isFriendly, isInsideBoard, step } from "./utils";
import type { MoveGenerator } from "./types";

const EVEN_ROW_EMBASSY_OFFSETS: readonly HexCoord[] = [
  { q: 0, r: -2 },
  { q: 1, r: -1 },
  { q: -2, r: -1 },
  { q: -2, r: 1 },
  { q: 1, r: 1 },
  { q: 0, r: 2 },
];

const ODD_ROW_EMBASSY_OFFSETS: readonly HexCoord[] = [
  { q: 0, r: -2 },
  { q: 2, r: -1 },
  { q: -1, r: -1 },
  { q: 2, r: 1 },
  { q: -1, r: 1 },
  { q: 0, r: 2 },
];

const isAtEmbassy = (origin: HexCoord, embassy: HexCoord): boolean =>
  origin.q === embassy.q && origin.r === embassy.r;

const collectEmbassyMoves = (
  origin: HexCoord,
  offsets: readonly HexCoord[],
  board: Parameters<MoveGenerator>[0]["board"],
  piece: Parameters<MoveGenerator>[0]["piece"],
): HexCoord[] => {
  const moves: HexCoord[] = [];

  for (const offset of offsets) {
    const destination = { q: origin.q + offset.q, r: origin.r + offset.r };
    if (!isInsideBoard(board, destination)) continue;

    const tile = getTile(board, destination);
    if (!tile) continue;
    if (isFriendly(piece, tile.piece)) continue;

    moves.push(destination);
  }

  return moves;
};

const collectStepMoves = (
  origin: HexCoord,
  board: Parameters<MoveGenerator>[0]["board"],
  piece: Parameters<MoveGenerator>[0]["piece"],
): HexCoord[] => {
  const moves: HexCoord[] = [];

  for (const direction of ALL_DIRECTIONS) {
    const destination = step(origin, direction);
    if (!isInsideBoard(board, destination)) continue;

    const tile = getTile(board, destination);
    if (!tile) continue;
    if (isFriendly(piece, tile.piece)) continue;

    moves.push(destination);
  }

  return moves;
};

export const getAmbassadorMoves: MoveGenerator = ({ board, origin, piece, state }) => {
  const embassy = state.embassyLocations[piece.player];

  if (isAtEmbassy(origin, embassy)) {
    const isOddRow = origin.r % 2 !== 0;
    const offsets = isOddRow ? ODD_ROW_EMBASSY_OFFSETS : EVEN_ROW_EMBASSY_OFFSETS;
    return collectEmbassyMoves(origin, offsets, board, piece);
  }

  return collectStepMoves(origin, board, piece);
};
