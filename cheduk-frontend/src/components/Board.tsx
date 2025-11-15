import React, { useMemo } from "react";
import boardCells from "../data/board-data";
import { useGameStore } from "../store/gameStore";
import PieceComponent from "./Piece";
import type { CellData } from "../data/board-data";

type BoardKey = `${number},${number}`;

interface HexCoord {
  q: number;
  r: number;
}

/**
 * Calculates the geometric center of an SVG path string by parsing its commands.
 * This function processes a sequence of SVG path commands (M, m, L, l, H, h, Z, z)
 * to determine the absolute coordinates of all vertices, then finds the center
 * of the resulting bounding box. It handles implicit subsequent commands.
 * @param d The SVG path data string.
 * @returns The {x, y} coordinates of the center.
 */
function getPathCenter(d: string): { x: number; y: number } {
  const commands = d.match(/[a-zA-Z][^a-zA-Z]*/g);
  if (!commands) return { x: 0, y: 0 };

  const points: { x: number; y: number }[] = [];
  let currentX = 0;
  let currentY = 0;

  for (const commandStr of commands) {
    const command = commandStr[0];
    const args = commandStr
      .substring(1)
      .trim()
      .split(/[\s,]+/)
      .map((n) => parseFloat(n))
      .filter((n) => !isNaN(n));

    let cmd = command;
    while (args.length > 0) {
      switch (cmd) {
        case "M":
          currentX = args.shift()!;
          currentY = args.shift()!;
          points.push({ x: currentX, y: currentY });
          cmd = "L"; // Subsequent pairs are treated as L
          break;
        case "m":
          // The first coordinate pair is relative to the start of the path.
          // If it's the very first command, it's relative to (0,0).
          currentX += args.shift()!;
          currentY += args.shift()!;
          points.push({ x: currentX, y: currentY });
          cmd = "l"; // Subsequent pairs are treated as l
          break;
        case "L":
          currentX = args.shift()!;
          currentY = args.shift()!;
          points.push({ x: currentX, y: currentY });
          break;
        case "l":
          currentX += args.shift()!;
          currentY += args.shift()!;
          points.push({ x: currentX, y: currentY });
          break;
        case "H":
          currentX = args.shift()!;
          points.push({ x: currentX, y: currentY });
          break;
        case "h":
          currentX += args.shift()!;
          points.push({ x: currentX, y: currentY });
          break;
        case "Z":
        case "z":
          args.length = 0; // End of path
          break;
        default:
          // This case should ideally not be hit with well-formed paths,
          // but we clear args to prevent an infinite loop.
          args.length = 0;
          break;
      }
    }
  }

  if (points.length === 0) return { x: 0, y: 0 };

  const minX = Math.min(...points.map((p) => p.x));
  const maxX = Math.max(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const maxY = Math.max(...points.map((p) => p.y));

  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
  };
}

interface MappedCell {
  pathData: CellData;
  center: { x: number; y: number };
}

// Create a mapping from q,r coordinates to the board cell data and its center.
const coordinateToCellMap: Record<BoardKey, MappedCell> = {};
const COLS = 11;
const ROWS = 12;

// Assuming boardCells is ordered row-by-row (r then q)
for (let r = 0; r < ROWS; r++) {
  for (let q = 0; q < COLS; q++) {
    const key = `${q},${r}` as BoardKey;
    const index = r * COLS + q;
    if (index < boardCells.length) {
      const pathData = boardCells[index];
      coordinateToCellMap[key] = {
        pathData,
        center: getPathCenter(pathData.d),
      };
    }
  }
}

const toBoardKey = ({ q, r }: HexCoord): BoardKey => `${q},${r}` as BoardKey;

const Board: React.FC = () => {
  const {
    gameState,
    selectedTile,
    validActions,
    resurrectionState,
    handleTileClick,
  } = useGameStore();

  const { board, territories, embassyLocations } = gameState;

  const tiles = useMemo(() => Object.values(board), [board]);
  const selectedKey = selectedTile ? toBoardKey(selectedTile) : null;

  const moveTargets = useMemo(() => {
    const targets = new Set<BoardKey>();
    validActions
      .filter((action) => action.type === "move")
      .forEach((action) => targets.add(toBoardKey(action.to)));
    return targets;
  }, [validActions]);

  const resurrectionTargets = useMemo(() => {
    if (!resurrectionState.isResurrecting) {
      return new Set<BoardKey>();
    }

    const targets = new Set<BoardKey>();
    validActions
      .filter((action) => action.type === "resurrect")
      .forEach((action) => targets.add(toBoardKey(action.to)));
    return targets;
  }, [resurrectionState.isResurrecting, validActions]);

  const embassyTiles = useMemo(() => {
    const targets = new Set<BoardKey>();
    Object.values(embassyLocations).forEach((location) => {
      targets.add(toBoardKey(location));
    });
    return targets;
  }, [embassyLocations]);

  const territoryTiles = useMemo(() => {
    const createSet = (coords: HexCoord[] | undefined) => {
      const set = new Set<BoardKey>();
      coords?.forEach((coord) => set.add(toBoardKey(coord)));
      return set;
    };

    return {
      Red: createSet(territories?.Red),
      Blue: createSet(territories?.Blue),
    };
  }, [territories]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "800px",
        margin: "auto",
        aspectRatio: "800 / 742",
      }}
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 742" // Original SVG viewBox
        preserveAspectRatio="xMidYMid meet"
      >
        <g transform="rotate(90, 413.75669, 458.02477)">
          {tiles.map((tile) => {
            const key = toBoardKey(tile);
            const cellInfo = coordinateToCellMap[key];

            if (!cellInfo) return null;

            const { pathData, center } = cellInfo;

            const isSelected = key === selectedKey;
            const isValidMove = moveTargets.has(key);
            const isValidResurrectionMove = resurrectionTargets.has(key);
            const isEmbassy = embassyTiles.has(key);
            const isRedTerritory = territoryTiles.Red.has(key);
            const isBlueTerritory = territoryTiles.Blue.has(key);

            let fillColor = pathData.fill; // Default fill
            if (isSelected) {
              fillColor = "rgba(234, 179, 8, 0.5)"; // yellow-500/50
            } else if (isValidMove || isValidResurrectionMove) {
              fillColor = "rgba(34, 197, 94, 0.4)"; // green-500/40
            } else if (isEmbassy) {
              fillColor = "rgba(147, 197, 253, 0.3)"; // blue-300/30
            } else if (isRedTerritory) {
              fillColor = "rgba(239, 68, 68, 0.2)"; // red-500/20
            } else if (isBlueTerritory) {
              fillColor = "rgba(59, 130, 246, 0.2)"; // blue-500/20
            }

            return (
              <g key={key}>
                <path
                  d={pathData.d}
                  fill={fillColor}
                  stroke="#7c7c7c"
                  strokeWidth={1.5}
                  className="cursor-pointer transition-colors hover:opacity-75"
                  onClick={() => handleTileClick(tile)}
                />
                {tile.piece && (
                  // We need to counteract the rotation of the parent <g>
                  // to keep the piece upright.
                  <g
                    transform={`rotate(-90, ${center.x}, ${center.y})`}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the path's onClick from firing too
                      handleTileClick(tile);
                    }}
                  >
                    <foreignObject
                      x={center.x - 24}
                      y={center.y - 24}
                      width="48"
                      height="48"
                      style={{ pointerEvents: "none" }} // Make foreignObject transparent to clicks
                    >
                      <PieceComponent piece={tile.piece} />
                    </foreignObject>
                  </g>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default Board;

