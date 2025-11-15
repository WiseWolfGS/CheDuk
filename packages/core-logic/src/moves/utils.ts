import type { BoardState, HexCoord, Piece, Tile } from "../types";
import { toBoardKey } from "../types";

export type HexDirection = "E" | "W" | "NE" | "NW" | "SE" | "SW";

export const ALL_DIRECTIONS: readonly HexDirection[] = [
  "E",
  "W",
  "NE",
  "NW",
  "SE",
  "SW",
] as const;

const EVEN_ROW_OFFSETS: Record<HexDirection, HexCoord> = {
  E: { q: 1, r: 0 },
  W: { q: -1, r: 0 },
  NE: { q: 0, r: -1 },
  NW: { q: -1, r: -1 },
  SE: { q: 0, r: 1 },
  SW: { q: -1, r: 1 },
};

const ODD_ROW_OFFSETS: Record<HexDirection, HexCoord> = {
  E: { q: 1, r: 0 },
  W: { q: -1, r: 0 },
  NE: { q: 1, r: -1 },
  NW: { q: 0, r: -1 },
  SE: { q: 1, r: 1 },
  SW: { q: 0, r: 1 },
};

export const step = (origin: HexCoord, direction: HexDirection): HexCoord => {
  const offsets = origin.r % 2 === 0 ? EVEN_ROW_OFFSETS : ODD_ROW_OFFSETS;
  const delta = offsets[direction];
  return { q: origin.q + delta.q, r: origin.r + delta.r };
};

export const offsetFromAngle = (
  angle: 0 | 60 | 120 | 180 | 240 | 300,
  isOddRow: boolean,
): HexCoord => {
  switch (angle) {
    case 0:
      return { q: 1, r: 0 };
    case 60:
      return isOddRow ? { q: 1, r: -1 } : { q: 0, r: -1 };
    case 120:
      return isOddRow ? { q: 0, r: -1 } : { q: -1, r: -1 };
    case 180:
      return { q: -1, r: 0 };
    case 240:
      return isOddRow ? { q: 0, r: 1 } : { q: -1, r: 1 };
    case 300:
      return isOddRow ? { q: 1, r: 1 } : { q: 0, r: 1 };
    default:
      return { q: 0, r: 0 };
  }
};

export const getTile = (board: BoardState, coord: HexCoord): Tile | undefined =>
  board[toBoardKey(coord)];

export const isInsideBoard = (board: BoardState, coord: HexCoord): boolean =>
  Boolean(getTile(board, coord));

export const isFriendly = (piece: Piece, occupant: Piece | null): boolean =>
  Boolean(occupant && occupant.player === piece.player);

export const isEnemy = (piece: Piece, occupant: Piece | null): boolean =>
  Boolean(occupant && occupant.player !== piece.player);

export interface CubeCoord {
  x: number;
  y: number;
  z: number;
}

/**
 * Converts odd-r offset coordinates to cube coordinates.
 * @param coord The odd-r offset coordinate {q, r}.
 * @returns The cube coordinate {x, y, z}.
 */
export const offsetToCube = (coord: HexCoord): CubeCoord => {
  const x = coord.q - (coord.r - (coord.r & 1)) / 2;
  const z = coord.r;
  const y = -x - z;
  return { x, y, z };
};

/**
 * Calculates the distance between two cube coordinates.
 * @param a The first cube coordinate.
 * @param b The second cube coordinate.
 * @returns The distance in number of hexes.
 */
export const cubeDistance = (a: CubeCoord, b: CubeCoord): number => {
  return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z)) / 2;
};
