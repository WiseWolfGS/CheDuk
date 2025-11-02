export type Player = "Red" | "Blue";

export type PieceType =
  | "Chief" // 수반 (首)
  | "Diplomat" // 외교관 (外)
  | "SpecialEnvoy" // 특사 (特)
  | "Ambassador" // 대사 (使)
  | "Spy" // 첩자 (諜)
  | "Guard"; // 경호원 (守)

export interface Piece {
  id: string;
  type: PieceType;
  player: Player;
}

export interface Tile {
  q: number;
  r: number;
  piece: Piece | null;
}

export type BoardState = Record<string, Tile>; // key as "q,r"

export interface GameState {
  board: BoardState;
  currentPlayer: Player;
  infoScores: Record<Player, number>;
  capturedPieces: Record<Player, Piece[]>;
  turn: number;
}
