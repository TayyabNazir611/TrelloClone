"use client";

import React, { useState } from "react";
import { Plus, MoreHorizontal, Edit3, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card as UICard } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Column } from "../types/board";
import { useBoard } from "../hooks/use-board";
import { useDragDrop } from "../hooks/use-drag-drop";
import { BoardCard } from "./board-card";

interface BoardColumnProps {
  column: Column;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({ column }) => {
  const { createCard, updateColumn, deleteColumn, moveCard } = useBoard();
  const { handleDragOver, handleDrop, handleDragStart } = useDragDrop();
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardDesc, setNewCardDesc] = useState("");
  const [editedTitle, setEditedTitle] = useState(column.title);

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      createCard(column.id, {
        title: newCardTitle.trim(),
        description: newCardDesc.trim(),
      });
      setNewCardTitle("");
      setNewCardDesc("");
      setIsAddingCard(false);
    }
  };

  const handleUpdateTitle = () => {
    if (editedTitle.trim() && editedTitle !== column.title) {
      updateColumn(column.id, { title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleDeleteColumn = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this column? All cards will be lost."
      )
    ) {
      deleteColumn(column.id);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: "add" | "edit") => {
    if (e.key === "Enter") {
      if (action === "add") {
        handleAddCard();
      } else {
        handleUpdateTitle();
      }
    } else if (e.key === "Escape") {
      if (action === "add") {
        setIsAddingCard(false);
        setNewCardTitle("");
      } else {
        setIsEditingTitle(false);
        setEditedTitle(column.title);
      }
    }
  };

  const handleCardDrop = (e: React.DragEvent, targetIndex: number) => {
    console.log("Drop on column", column, "at index", targetIndex);
    handleDrop(e, column.id, targetIndex, moveCard);
  };

  return (
    <UICard className="w-80 flex-shrink-0 bg-gray-50 border-0 shadow-sm">
      <div className="p-4 space-y-4">
        {/* Column Header */}
        <div className="flex items-center justify-between">
          {isEditingTitle ? (
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, "edit")}
              onBlur={handleUpdateTitle}
              className="font-semibold text-gray-900 bg-transparent border-0 p-0 focus:ring-0"
              autoFocus
            />
          ) : (
            <h3 className="font-semibold text-gray-900 text-lg">
              {column.title}
            </h3>
          )}

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
              {column.cards.length}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="h-8 w-8 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditingTitle(true)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit title
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteColumn}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Cards */}
        <div
          className="space-y-3 min-h-[200px]"
          onDragOver={handleDragOver}
          onDrop={(e) => handleCardDrop(e, column.cards.length)}
        >
          {column.cards.map((card, index) => (
            <div
              key={card.id}
              draggable
              onDragStart={() => {
                console.log("🔥 onDragStart fired");
                handleDragStart(card?.id, column?.id, index);
              }}
              onDragOver={handleDragOver}
              onDrop={(e) => handleCardDrop(e, index)}
            >
              <BoardCard card={card} columnId={column.id} index={index} />
            </div>
          ))}
        </div>

        {/* Add Card */}
        {isAddingCard ? (
          <div className="space-y-2">
            <Input
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, "add")}
              placeholder="Enter card title..."
              className="w-full"
              autoFocus
            />
            <Input
              value={newCardDesc}
              onChange={(e) => setNewCardDesc(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, "add")}
              placeholder="Enter card Description..."
              className="w-full"
              autoFocus
            />
            <div className="flex space-x-2">
              <Button onClick={handleAddCard} className="flex-1">
                Add Card
              </Button>
              <Button
                onClick={() => setIsAddingCard(false)}
                // variant="outline"
                // size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setIsAddingCard(true)}
            // variant="ghost"
            className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <Plus className="w-4 h-4" />
            <span>Add a card</span>
          </Button>
        )}
      </div>
    </UICard>
  );
};
