import type { GameAction } from "@cheduk/core-logic";

export const describeGameAction = (action: GameAction): string => {
  switch (action.type) {
    case "move":
      return `Move to (${action.to.q}, ${action.to.r})`;
    case "gatherInfo":
      return "Gather Information";
    case "return":
      return `Return to (${action.to.q}, ${action.to.r})`;
    case "resurrect":
      return "Resurrect at embassy";
    case "placeAmbassador":
      return `Place Ambassador at (${action.to.q}, ${action.to.r})`;
    case "placeSpy":
      return `Place Spy at (${action.to.q}, ${action.to.r})`;
    case "castle":
      return "Castle (swap Chief & Diplomat)";
    default:
      return "Unknown Action";
  }
};
