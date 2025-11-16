import type {
  GameAction,
  GameState,
  PieceType,
  Player,
  Tile,
} from "@cheduk/core-logic";
import {
  createInitialGameState,
  getValidActions,
  performAction,
} from "@cheduk/core-logic";
import { create } from "zustand";

interface GameStore {
  gameState: GameState;
  selectedTile: Tile | null;
  validActions: GameAction[];
  globalSpecialActions: GameAction[];
  isActionModalOpen: boolean;
  resurrectionState: {
    isResurrecting: boolean;
    pieceId: string | null;
  };
  specialActionModal: {
    isOpen: boolean;
    options: SpecialActionOption[];
  };

  handleTileClick: (clickedTile: Tile) => void;
  handleAction: (action: GameAction) => void;
  startResurrection: (pieceId: string) => void;
  openSpecialActionModal: () => void;
  closeSpecialActionModal: () => void;
  cancelAction: () => void;
  enterMoveMode: () => void;
  resetGame: () => void;
}

const initialGameState = createInitialGameState();
const getOpponent = (player: Player): Player =>
  player === "Red" ? "Blue" : "Red";

const computeGlobalSpecialActions = (state: GameState): GameAction[] => {
  const actions = getValidActions(
    state.board,
    -1,
    -1,
    state.embassyLocations,
    state,
  );
  return actions.filter((action) => action.type === "resurrect");
};

export type SpecialActionOption =
  | {
      kind: "direct";
      action: GameAction;
      pieceId: string;
      pieceType: PieceType;
    }
  | {
      kind: "choose-destination";
      pieceId: string;
      pieceType: PieceType;
    };

const buildSpecialActionOptions = (
  state: GameState,
  actions: GameAction[],
): SpecialActionOption[] => {
  const options: SpecialActionOption[] = [];
  const grouped = new Map<string, GameAction[]>();

  actions.forEach((action) => {
    if (action.type !== "resurrect") return;
    if (!action.pieceId) return;
    const list = grouped.get(action.pieceId) ?? [];
    list.push(action);
    grouped.set(action.pieceId, list);
  });

  const capturedByOpponent = state.capturedPieces[getOpponent(state.currentPlayer)];

  grouped.forEach((list, pieceId) => {
    const pieceType =
      capturedByOpponent.find((piece) => piece.id === pieceId)?.type ?? "Spy";

    if (list.length === 1) {
      options.push({
        kind: "direct",
        action: list[0],
        pieceId,
        pieceType,
      });
    } else {
      options.push({
        kind: "choose-destination",
        pieceId,
        pieceType,
      });
    }
  });
  return options;
};

const initialValidActions = getValidActions(
  initialGameState.board,
  -1,
  -1,
  initialGameState.embassyLocations,
  initialGameState,
);

const initialState = {
  gameState: initialGameState,
  selectedTile: null,
  validActions: initialValidActions,
  globalSpecialActions: computeGlobalSpecialActions(initialGameState),
  isActionModalOpen: false,
  resurrectionState: {
    isResurrecting: false,
    pieceId: null,
  },
  specialActionModal: {
    isOpen: false,
    options: [],
  },
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  handleAction: (action) => {
    const newGameState = performAction(get().gameState, action);
    const newValidActions = getValidActions(
      newGameState.board,
      -1,
      -1,
      newGameState.embassyLocations,
      newGameState,
    );
    set({
      gameState: newGameState,
      selectedTile: null,
      validActions: newValidActions,
      globalSpecialActions: computeGlobalSpecialActions(newGameState),
      specialActionModal: { isOpen: false, options: [] },
      isActionModalOpen: false,
      resurrectionState: { isResurrecting: false, pieceId: null },
    });
  },

  startResurrection: (pieceId) => {
    const { gameState } = get();
    const actions = getValidActions(
      gameState.board,
      // Dummy coords, not used for resurrect action generation
      -1,
      -1,
      gameState.embassyLocations,
      gameState,
    );
    set({
      selectedTile: null,
      resurrectionState: { isResurrecting: true, pieceId },
      validActions: actions.filter(
        (a) => a.type === "resurrect" && a.pieceId === pieceId,
      ),
    });
  },

  openSpecialActionModal: () => {
    const { globalSpecialActions, gameState } = get();
    if (globalSpecialActions.length === 0) return;

    const options = buildSpecialActionOptions(
      gameState,
      globalSpecialActions,
    );
    if (options.length === 0) return;

    set({
      selectedTile: null,
      specialActionModal: { isOpen: true, options },
    });
  },

  closeSpecialActionModal: () => {
    set({
      specialActionModal: { isOpen: false, options: [] },
    });
  },

  cancelAction: () => {
    set({
      selectedTile: null,
      validActions: [],
      isActionModalOpen: false,
      resurrectionState: { isResurrecting: false, pieceId: null },
    });
  },

  enterMoveMode: () => {
    set({ isActionModalOpen: false });
  },

  handleTileClick: (clickedTile) => {
    const {
      gameState,
      selectedTile,
      handleAction,
      validActions,
      resurrectionState,
    } = get();

    // --- Placement Phase Logic ---
    if (gameState.gamePhase.startsWith("placement")) {
      const targetAction = validActions.find((action) => {
        if (
          action.type !== "placeAmbassador" &&
          action.type !== "placeSpy"
        ) {
          return false;
        }
        return action.to.q === clickedTile.q && action.to.r === clickedTile.r;
      });

      if (targetAction) {
        handleAction(targetAction);
      }
      return; // End click handling for placement phase
    }

    // --- Main Game Phase Logic ---

    // 1. Handle resurrection action
    if (resurrectionState.isResurrecting) {
      const targetAction = validActions.find((action) => {
        if (action.type !== "resurrect") return false;
        return action.to.q === clickedTile.q && action.to.r === clickedTile.r;
      });

      if (targetAction) {
        handleAction(targetAction);
      } else {
        // Clicked on an invalid tile, cancel resurrection
        set({
          resurrectionState: { isResurrecting: false, pieceId: null },
          validActions: [],
        });
      }
      return;
    }

    if (selectedTile) {
      // A piece is already selected, try to perform an action
      const targetAction = validActions.find((action) => {
        if (action.type !== "move") return false;
        return action.to.q === clickedTile.q && action.to.r === clickedTile.r;
      });

      if (targetAction) {
        handleAction(targetAction);
      } else {
        // Clicked on an invalid tile, so deselect
        set({ selectedTile: null, validActions: [] });
      }
    } else {
      // No piece selected, check for return action or piece selection
      const pieceAtClickedTile =
        gameState.board[`${clickedTile.q},${clickedTile.r}`]?.piece;

      // 2. Check if player is trying to return a spy
      const returningSpyId = gameState.spiesReadyToReturn.find((id) =>
        gameState.returningSpies.some(
          (p) => p.id === id && p.player === gameState.currentPlayer,
        ),
      );
      const isInTerritory = gameState.territories[gameState.currentPlayer]?.some(
        (t) => t.q === clickedTile.q && t.r === clickedTile.r,
      );

      if (!pieceAtClickedTile && returningSpyId && isInTerritory) {
        const returnAction: GameAction = {
          type: "return",
          to: clickedTile,
          pieceId: returningSpyId,
        };
        handleAction(returnAction);
        return; // End click handling
      }

      // 3. If not returning, try to select a piece
      if (
        pieceAtClickedTile &&
        pieceAtClickedTile.player === gameState.currentPlayer
      ) {
        const actions = getValidActions(
          gameState.board,
          clickedTile.q,
          clickedTile.r,
          gameState.embassyLocations,
          gameState,
        );

        const hasMoveAction = actions.some((a) => a.type === "move");
        const hasSpecialActions = actions.some(
          (a) => a.type !== "move",
        );

        if (hasSpecialActions && hasMoveAction) {
          set({
            selectedTile: clickedTile,
            validActions: actions,
            isActionModalOpen: true,
          });
        } else {
          set({ selectedTile: clickedTile, validActions: actions });
        }
      } else {
        // Clicked on an empty tile or opponent's piece, do nothing
        set({ selectedTile: null, validActions: [] });
      }
    }
  },

  resetGame: () => {
    const newInitialState = createInitialGameState();
    const newInitialActions = getValidActions(
      newInitialState.board,
      -1,
      -1,
      newInitialState.embassyLocations,
      newInitialState,
    );
    set({
      ...initialState,
      gameState: newInitialState,
      validActions: newInitialActions,
      globalSpecialActions: computeGlobalSpecialActions(newInitialState),
    });
  },
}));
