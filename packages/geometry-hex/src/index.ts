// geometry-hex/src/index.ts
// Orientation: pointy-top (vertex up)
// Offset layout: odd-r (row offset)  ← 여기서 r 홀수행이 x를 반 칸 밀림

export const TILE_WIDTH = 173; // center-to-center horizontally
export const ROW_HEIGHT = 148; // center-to-center vertically
export const X_ORIGIN = 114;
export const Y_ORIGIN = 208;

export const COLS = 11;
export const ROWS = 12;

export function offsetToPixel(q: number, r: number) {
  // odd-r: 홀수 행이면 x를 반 칸(= TILE_WIDTH/2) 우측 이동
  const x = X_ORIGIN + q * TILE_WIDTH + (r & 1 ? TILE_WIDTH / 2 : 0);
  const y = Y_ORIGIN + r * ROW_HEIGHT;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

const coords: Record<string, { x: number; y: number }> = {};
for (let r = 0; r < ROWS; r++) {
  for (let q = 0; q < COLS; q++) {
    coords[`${q},${r}`] = offsetToPixel(q, r);
  }
}
export const tileCoordinates = coords;
