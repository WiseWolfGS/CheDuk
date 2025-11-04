"use strict";
// geometry-hex/src/index.ts
// Orientation: pointy-top (vertex up)
// Offset layout: odd-r (row offset)  ← 여기서 r 홀수행이 x를 반 칸 밀림
Object.defineProperty(exports, "__esModule", { value: true });
exports.tileCoordinates = exports.ROWS = exports.COLS = exports.Y_ORIGIN = exports.X_ORIGIN = exports.ROW_HEIGHT = exports.TILE_WIDTH = void 0;
exports.offsetToPixel = offsetToPixel;
exports.TILE_WIDTH = 173; // center-to-center horizontally
exports.ROW_HEIGHT = 148; // center-to-center vertically
exports.X_ORIGIN = 114;
exports.Y_ORIGIN = 208;
exports.COLS = 11;
exports.ROWS = 12;
function offsetToPixel(q, r) {
    // odd-r: 홀수 행이면 x를 반 칸(= TILE_WIDTH/2) 우측 이동
    var x = exports.X_ORIGIN + q * exports.TILE_WIDTH + (r & 1 ? exports.TILE_WIDTH / 2 : 0);
    var y = exports.Y_ORIGIN + r * exports.ROW_HEIGHT;
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}
var coords = {};
for (var r = 0; r < exports.ROWS; r++) {
    for (var q = 0; q < exports.COLS; q++) {
        coords["".concat(q, ",").concat(r)] = offsetToPixel(q, r);
    }
}
exports.tileCoordinates = coords;
