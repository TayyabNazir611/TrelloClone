"use client";

import React from "react";
import { useWebSocket } from "../contexts/websocket-context";
import { BoardHeader } from "./board-header";
import { BoardColumn } from "./board-column";

export const Board: React.FC = () => {
  const { board, isConnected } = useWebSocket();

  if (!board) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isConnected ? "Loading board..." : "Connecting to server..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <BoardHeader />

      <div className="p-[12px] md:p-[24px]">
        <div className="flex flex-row md:flex-col space-x-[24px] overflow-x-auto pb-[24px]">
          {board.columns.map((column) => (
            <BoardColumn key={column.id} column={column} />
          ))}
        </div>
      </div>
    </div>
  );
};
