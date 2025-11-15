import type { HexCoord, Player } from "./types";

// TODO: Replace with actual coordinates based on the game board's numbered tiles.
// These are placeholder coordinates.
export const AMBASSADOR_PLACEMENT_ZONES: Record<Player, HexCoord[]> = {
  Blue: [
    { q: 3, r: 2 }, // 4
    { q: 4, r: 2 }, // 4
    { q: 5, r: 2 }, // 4
    { q: 2, r: 3 }, // 4
    { q: 3, r: 3 }, // 3
    { q: 4, r: 3 }, // 3
    { q: 2, r: 4 }, // 4
    { q: 3, r: 4 }, // 3
    { q: 4, r: 4 }, // 2
    { q: 1, r: 5 }, // 4
    { q: 2, r: 5 }, // 3
    { q: 3, r: 5 }, // 2
    { q: 1, r: 6 }, // 4
    { q: 2, r: 6 }, // 3
    { q: 3, r: 6 }, // 2
    { q: 1, r: 7 }, // 4
    { q: 2, r: 7 }, // 3
    { q: 2, r: 8 }, // 4
  ],
  Red: [
    { q: 8, r: 3 }, // 4
    { q: 9, r: 4 }, // 4
    { q: 8, r: 4 }, // 3
    { q: 9, r: 5 }, // 2
    { q: 8, r: 5 }, // 3
    { q: 7, r: 5 }, // 4
    { q: 9, r: 6 }, // 2
    { q: 8, r: 6 }, // 3
    { q: 7, r: 6 }, // 4
    { q: 8, r: 7 }, // 2
    { q: 7, r: 7 }, // 3
    { q: 6, r: 7 }, // 4
    { q: 8, r: 8 }, // 3
    { q: 7, r: 8 }, // 3
    { q: 6, r: 8 }, // 4
    { q: 7, r: 9 }, // 4
    { q: 6, r: 9 }, // 4
    { q: 5, r: 9 }, // 4
  ],
};

// TODO: Replace with actual coordinates.
export const SPY_PLACEMENT_ZONES: Record<Player, HexCoord[]> = {
  Blue: [
    { q: 4, r: 0 },
    { q: 5, r: 0 },
    { q: 6, r: 0 },
    { q: 3, r: 1 },
    { q: 4, r: 1 },
    { q: 5, r: 1 },
    { q: 3, r: 2 },
    { q: 4, r: 2 },
    { q: 5, r: 2 },
    { q: 2, r: 3 },
    { q: 3, r: 3 },
    { q: 4, r: 3 },
    { q: 2, r: 4 },
    { q: 3, r: 4 },
    { q: 4, r: 4 },
    { q: 1, r: 5 },
    { q: 2, r: 5 },
    { q: 3, r: 5 },
    { q: 1, r: 6 },
    { q: 2, r: 6 },
    { q: 3, r: 6 },
    { q: 0, r: 7 },
    { q: 1, r: 7 },
    { q: 2, r: 7 },
    { q: 0, r: 8 },
    { q: 1, r: 8 },
    { q: 2, r: 8 },
    { q: 0, r: 9 },
    { q: 1, r: 9 },
    { q: 0, r: 10 },
    { q: 1, r: 10 },
    { q: 0, r: 11 },
    ],
  Red: [
    { q: 10, r: 0 },
    { q: 10, r: 1 },
    { q: 9, r: 1 },
    { q: 10, r: 2 },
    { q: 9, r: 2 },
    { q: 10, r: 3 },
    { q: 9, r: 3 },
    { q: 8, r: 3 },
    { q: 10, r: 4 },
    { q: 9, r: 4 },
    { q: 8, r: 4 },
    { q: 9, r: 5 },
    { q: 8, r: 5 },
    { q: 7, r: 5 },
    { q: 9, r: 6 },
    { q: 8, r: 6 },
    { q: 7, r: 6 },
    { q: 8, r: 7 },
    { q: 7, r: 7 },
    { q: 6, r: 7 },
    { q: 8, r: 8 },
    { q: 7, r: 8 },
    { q: 6, r: 8 },
    { q: 7, r: 9 },
    { q: 6, r: 9 },
    { q: 5, r: 9 },
    { q: 7, r: 10 },
    { q: 6, r: 10 },
    { q: 5, r: 10 },
    { q: 6, r: 11 },
    { q: 5, r: 11 },
    { q: 4, r: 11 },
  ],
};
