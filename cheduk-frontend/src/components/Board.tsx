import type { BoardState, Tile } from '@cheduk/core-logic';
import { tileCoordinates } from '@cheduk/geometry-hex';
import PieceComponent from './Piece';

interface BoardProps {
  board: BoardState;
  selectedTile: Tile | null;
  validMoves: { q: number; r: number }[];
  onTileClick: (tile: Tile) => void;
}

const Board = ({ board, selectedTile, validMoves, onTileClick }: BoardProps) => {
  return (
    <div 
      className="relative bg-contain bg-no-repeat bg-center w-full max-w-5xl mx-auto aspect-square"
      style={{ backgroundImage: 'url(/board.svg)' }}
    >
      {/* Interactive Layer */}
      {Object.values(board).map((tile) => {
        const key = `${tile.q},${tile.r}`;
        const pixelCoords = tileCoordinates[key];
        if (!pixelCoords) return null;

        const isSelected = selectedTile?.q === tile.q && selectedTile?.r === tile.r;
        const isValidMove = validMoves.some(move => move.q === tile.q && move.r === tile.r);

        return (
          <div
            key={key}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
            style={{
              left: `${pixelCoords.x / 2048 * 100}%`,
              top: `${pixelCoords.y / 2048 * 100}%`,
              width: '48px',
              height: '48px',
            }}
            onClick={() => onTileClick(tile)}
          >
            {/* Tile Highlighter */}
            <div className={`w-full h-full rounded-full transition-colors ${isSelected ? 'bg-yellow-500/50' : isValidMove ? 'bg-green-500/40' : 'group-hover:bg-white/20'}`} />

            {/* Piece Component */}
            {tile.piece && (
              <div className='absolute top-0 left-0 w-full h-full flex items-center justify-center'>
                <PieceComponent piece={tile.piece} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Board;
