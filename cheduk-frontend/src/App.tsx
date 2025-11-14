import GamePage from "./pages/GamePage";
import { useGameStore } from "./store/gameStore";
import ActionChoiceModal from "./components/ActionChoiceModal";

function App() {
  const {
    isActionModalOpen,
    validActions,
    handleAction,
    cancelAction,
    enterMoveMode,
  } = useGameStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-800">
      <header className="w-full max-w-7xl mx-auto mb-4">
        <h1 className="text-4xl font-bold text-orange-400">CheDuk (체둑)</h1>
      </header>
      <main className="w-full max-w-7xl mx-auto">
        <GamePage />
      </main>
      <ActionChoiceModal
        isOpen={isActionModalOpen}
        actions={validActions}
        onSelect={handleAction}
        onSelectMove={enterMoveMode}
        onCancel={cancelAction}
      />
    </div>
  );
}

export default App;
