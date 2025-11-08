import type { GameState, Tile, GameAction } from "@cheduk/core-logic";
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
  isActionModalOpen: boolean;
  resurrectionState: {
    isResurrecting: boolean;
    pieceId: string | null;
  };

  handleTileClick: (clickedTile: Tile) => void;
  handleAction: (action: GameAction) => void;
  startResurrection: (pieceId: string) => void;
  cancelAction: () => void;
  enterMoveMode: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: createInitialGameState(),
  selectedTile: null,
  validActions: [],
  isActionModalOpen: false,
  resurrectionState: {
    isResurrecting: false,
    pieceId: null,
  },

  handleAction: (action) => {
    const newGameState = performAction(get().gameState, action);
    set({
      gameState: newGameState,
      selectedTile: null,
      validActions: [],
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
      const isInTerritory = gameState.territories[gameState.currentPlayer].some(
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
    set({ gameState: createInitialGameState() });
  },
}));
