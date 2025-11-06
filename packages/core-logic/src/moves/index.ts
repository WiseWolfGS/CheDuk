import type { PieceType } from "../types";
import type { MoveGenerator } from "./types";
import { getAmbassadorMoves } from "./ambassador";
import { getChiefMoves } from "./chief";
import { getDiplomatMoves } from "./diplomat";
import { getGuardMoves } from "./guard";
import { getSpecialEnvoyMoves } from "./specialEnvoy";
import { getSpyMoves } from "./spy";

export const MOVE_GENERATORS: Record<PieceType, MoveGenerator> = {
  Chief: getChiefMoves,
  Diplomat: getDiplomatMoves,
  SpecialEnvoy: getSpecialEnvoyMoves,
  Ambassador: getAmbassadorMoves,
  Spy: getSpyMoves,
  Guard: getGuardMoves,
};

export { getChiefMoves } from "./chief";
export { getGuardMoves } from "./guard";
export { getSpyMoves } from "./spy";
export { getDiplomatMoves } from "./diplomat";
export { getSpecialEnvoyMoves } from "./specialEnvoy";
export { getAmbassadorMoves } from "./ambassador";
export type { MoveGenerator, MoveGeneratorArgs } from "./types";
