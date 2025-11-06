import type {
  BoardState,
  GameState,
  HexCoord,
  Piece,
} from "../types";

export interface MoveGeneratorArgs {
  board: BoardState;
  origin: HexCoord;
  piece: Piece;
  state: GameState;
}

export type MoveGenerator = (args: MoveGeneratorArgs) => HexCoord[];
