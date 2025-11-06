export type Player = "Red" | "Blue";

export type PieceType =
  | "Chief" // 수반 (首)
  | "Diplomat" // 외교관 (外)
  | "SpecialEnvoy" // 특사 (特)
  | "Ambassador" // 대사 (使)
  | "Spy" // 첩자 (諜)
  | "Guard"; // 경호원 (守)

export interface HexCoord {
  /** Column index in the odd-r offset grid. */
  q: number;
  /** Row index in the odd-r offset grid. */
  r: number;
}

export type BoardKey = `${number},${number}`;

export const toBoardKey = (coord: HexCoord): BoardKey =>
  `${coord.q},${coord.r}` as BoardKey;

export interface Piece {
  id: string;
  type: PieceType;
  player: Player;
}

export interface Tile extends HexCoord {
  piece: Piece | null;
}

export type BoardState = Record<BoardKey, Tile>;

export type PieceCollection = Record<Player, Piece[]>;

export type InfoScoreTrack = Record<Player, number>;

export type EmbassyMap = Record<Player, HexCoord>;

export interface GameState {
  board: BoardState;
  currentPlayer: Player;
  turn: number;
  infoScores: InfoScoreTrack;
  capturedPieces: PieceCollection;
  embassyLocations: EmbassyMap;
  gameOver: boolean;
  winner: Player | null;
}

export interface MoveIntent {
  from: HexCoord;
  to: HexCoord;
}
