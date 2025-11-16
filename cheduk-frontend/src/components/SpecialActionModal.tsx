import React from "react";
import { describeGameAction } from "../utils/actionLabels";
import { useGameStore } from "../store/gameStore";
import type { SpecialActionOption } from "../store/gameStore";

const pieceTypeLabel: Record<string, string> = {
  Ambassador: "대사",
  Spy: "첩자",
  Chief: "수반",
  Diplomat: "외교관",
  Guard: "경호원",
  SpecialEnvoy: "특사",
};

const getOptionLabel = (option: SpecialActionOption): string => {
  const typeLabel = pieceTypeLabel[option.pieceType] ?? option.pieceType;
  if (option.kind === "direct") {
    return `${typeLabel} 부활 - ${describeGameAction(option.action)}`;
  }
  return `${typeLabel} 부활 위치 선택`;
};

const SpecialActionModal: React.FC = () => {
  const specialActionModal = useGameStore(
    (state) => state.specialActionModal,
  );
  const handleAction = useGameStore((state) => state.handleAction);
  const startResurrection = useGameStore((state) => state.startResurrection);
  const closeSpecialActionModal = useGameStore(
    (state) => state.closeSpecialActionModal,
  );

  if (!specialActionModal.isOpen) return null;

  const handleSelect = (option: SpecialActionOption): void => {
    if (option.kind === "direct") {
      handleAction(option.action);
    } else {
      startResurrection(option.pieceId);
    }
    closeSpecialActionModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold text-white">특수 행동 선택</h3>
        <div className="flex flex-col space-y-3">
          {specialActionModal.options.map((option, index) => (
            <button
              key={`special-${option.pieceId}-${index}`}
              onClick={() => handleSelect(option)}
              className="rounded bg-purple-600 px-4 py-2 text-white shadow-md transition-transform hover:scale-105 hover:bg-purple-700"
            >
              {getOptionLabel(option)}
            </button>
          ))}
        </div>
        <button
          onClick={closeSpecialActionModal}
          className="mt-6 w-full rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default SpecialActionModal;
