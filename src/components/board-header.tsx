"use client";

import React, { useState } from "react";
import { Plus, Users, Wifi, WifiOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useWebSocket } from "../contexts/websocket-context";
import { useBoard } from "../hooks/use-board";

export const BoardHeader: React.FC = () => {
  const { isConnected, reconnect } = useWebSocket();
  const { board, createColumn } = useBoard();
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      createColumn(newColumnTitle.trim());
      setNewColumnTitle("");
      setIsAddingColumn(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddColumn();
    } else if (e.key === "Escape") {
      setIsAddingColumn(false);
      setNewColumnTitle("");
    }
  };

  return (
    <div className="flex items-center justify-between p-6 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div
        className="flex items-center"
        style={{ gap: "8px", alignItems: "center", justifyContent: "center" }}
      >
        <h1 className="text-[24px] md:text-2xl font-bold text-[#3B82F6]">
          {board?.title || "Loading..."}
        </h1>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <div className="flex items-center space-x-2 text-green-600">
              <Wifi className="w-4 h-4" color="green" />
              <span className="text-sm font-medium text-green-500 hidden md:visible">
                Connected
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-red-600">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm font-medium hidden md:visible">
                Disconnected
              </span>
              <Button
                onClick={reconnect}
                variant="outline"
                size="sm"
                className="text-xs px-[8px] py-[4px] bg-transparent border rounded-[5px]"
              >
                Reconnect
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3" style={{ gap: "12px" }}>
        <div className="flex items-center space-x-2 text-gray-600">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium hidden md:visible">
            Collaborative
          </span>
        </div>

        {isAddingColumn ? (
          <div className="flex items-center space-x-2 gap-[8px]">
            <Input
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Column title..."
              className="w-48 outline-none rounded-[4px] py-[8px] px-[12px]"
              autoFocus
            />
            <Button
              onClick={handleAddColumn}
              size="sm"
              className="w-[80px] flex items-center space-x-2 p-[8px] rounded-[8px] bg-[#3B82F6] text-[#fff] outline-none border-none cursor-pointer"
            >
              Add
            </Button>
            <Button
              onClick={() => setIsAddingColumn(false)}
              variant="outline"
              size="sm"
              className="w-[80px] flex items-center space-x-2 p-[8px] rounded-[8px] bg-transparent text-[#000] outline-none border cursor-pointer"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsAddingColumn(true)}
            className="flex items-center space-x-2 p-[8px] rounded-[8px] bg-[#3B82F6] text-[#fff] outline-none border-none cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Column</span>
          </Button>
        )}
      </div>
    </div>
  );
};
