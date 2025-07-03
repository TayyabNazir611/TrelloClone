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

      <div className="p-6">
        <div className="flex space-x-6 overflow-x-auto pb-6">
          {board.columns.map((column) => (
            <BoardColumn key={column.id} column={column} />
          ))}
        </div>
      </div>
    </div>
  );
};
