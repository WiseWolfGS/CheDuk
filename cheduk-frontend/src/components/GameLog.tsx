import React from "react";

const GameLog: React.FC = () => {
  return (
    <div className="bg-gray-900 bg-opacity-50 p-6 rounded-lg min-h-[150px]">
      <h2 className="text-2xl font-bold mb-4">게임 로그 및 컨트롤</h2>
      <div className="text-gray-400">
        {/* Game history and control buttons will go here */}
        <p>게임이 시작되었습니다.</p>
      </div>
    </div>
  );
};

export default GameLog;
