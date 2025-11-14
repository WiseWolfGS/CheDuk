import React from "react";
import type { GameAction } from "@cheduk/core-logic";

interface ActionChoiceModalProps {
  isOpen: boolean;
  actions: GameAction[];
  onSelect: (action: GameAction) => void;
  onSelectMove: () => void;
  onCancel: () => void;
}

const getActionLabel = (action: GameAction): string => {
  switch (action.type) {
    case "move":
      return `Move to (${action.to.q}, ${action.to.r})`;
    case "gatherInfo":
      return "Gather Information";
    case "return":
      return `Return to (${action.to.q}, ${action.to.r})`;
    default:
      return "Unknown Action";
  }
};

const ActionChoiceModal: React.FC<ActionChoiceModalProps> = ({
  isOpen,
  actions,
  onSelect,
  onSelectMove,
  onCancel,
}) => {
  if (!isOpen) {
    return null;
  }

  const moveActions = actions.filter((action) => action.type === "move");
  const specialActions = actions.filter((action) => action.type !== "move");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold text-white">Choose an action</h3>

        <div className="flex flex-col space-y-3">
          {specialActions.map((action, index) => (
            <button
              key={`special-${index}`}
              onClick={() => onSelect(action)}
              className="rounded bg-green-600 px-4 py-2 text-white shadow-md transition-transform hover:scale-105 hover:bg-green-700"
            >
              {getActionLabel(action)}
            </button>
          ))}

          {moveActions.length > 0 && (
            <button
              key="move-action"
              onClick={onSelectMove}
              className="rounded bg-blue-600 px-4 py-2 text-white shadow-md transition-transform hover:scale-105 hover:bg-blue-700"
            >
              Move ({moveActions.length} options)
            </button>
          )}
        </div>

        <button
          onClick={onCancel}
          className="mt-6 w-full rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ActionChoiceModal;

