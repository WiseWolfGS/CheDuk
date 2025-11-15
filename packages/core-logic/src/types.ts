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

export type GamePhase =
  | "placement-ambassador-red"
  | "placement-ambassador-blue"
  | "placement-spy-blue"
  | "placement-spy-red"
  | "main";

export interface GameState {
  board: BoardState;
  currentPlayer: Player;
  gamePhase: GamePhase;
  turn: number;
  infoScores: InfoScoreTrack;
  capturedPieces: PieceCollection;
  unplacedPieces: PieceCollection;
  embassyLocations: Partial<EmbassyMap>;
  embassyFirstCapture: Record<Player, boolean>;
  territories: Record<Player, HexCoord[]>;
  infoGatheredTiles: HexCoord[];
  spiesReadyToReturn: string[]; // pieceId[]
  returningSpies: Piece[];
  mainGameFirstPlayer: Player | null;
  gameOver: boolean;
  winner: Player | null;
}

export type MoveAction = {
  type: "move";
  from: HexCoord;
  to: HexCoord;
};

export type GatherInfoAction = {
  type: "gatherInfo";
  at: HexCoord;
  pieceId: string;
};

export type ReturnAction = {
  type: "return";
  to: HexCoord;
  pieceId: string;
};

export type ResurrectAction = {
  type: "resurrect";
  to: HexCoord;
  pieceId: string;
};

export type PlaceAmbassadorAction = {
  type: "placeAmbassador";
  to: HexCoord;
  player: Player;
};

export type PlaceSpyAction = {
  type: "placeSpy";
  to: HexCoord;
  player: Player;
  pieceId: string;
};

export type GameAction =
  | MoveAction
  | GatherInfoAction
  | ReturnAction
  | ResurrectAction
  | PlaceAmbassadorAction
  | PlaceSpyAction;
