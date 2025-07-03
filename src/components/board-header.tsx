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
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {board?.title || "Loading..."}
        </h1>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <div className="flex items-center space-x-2 text-green-600">
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">Connected</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-red-600">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm font-medium">Disconnected</span>
              <Button
                onClick={reconnect}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Reconnect
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <Users className="w-4 h-4" />
          <span className="text-sm font-medium">Collaborative</span>
        </div>

        {isAddingColumn ? (
          <div className="flex items-center space-x-2">
            <Input
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Column title..."
              className="w-48"
              autoFocus
            />
            <Button onClick={handleAddColumn} size="sm">
              Add
            </Button>
            <Button
              onClick={() => setIsAddingColumn(false)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsAddingColumn(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Column</span>
          </Button>
        )}
      </div>
    </div>
  );
};
