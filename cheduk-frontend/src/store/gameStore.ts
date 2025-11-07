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

  handleTileClick: (clickedTile: Tile) => void;
  handleAction: (action: GameAction) => void;
  cancelAction: () => void;
  enterMoveMode: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: createInitialGameState(),
  selectedTile: null,
  validActions: [],
  isActionModalOpen: false,

  handleAction: (action) => {
    const newGameState = performAction(get().gameState, action);
    set({
      gameState: newGameState,
      selectedTile: null,
      validActions: [],
      isActionModalOpen: false,
    });
  },

  cancelAction: () => {
    set({ selectedTile: null, validActions: [], isActionModalOpen: false });
  },

  enterMoveMode: () => {
    set({ isActionModalOpen: false });
  },

  handleTileClick: (clickedTile) => {
    const { gameState, selectedTile, handleAction, validActions } = get();

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

      // 1. Check if player is trying to return a spy
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

      // 2. If not returning, try to select a piece
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

        const hasSpecialActions = actions.some((a) => a.type !== "move");

        if (hasSpecialActions) {
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
