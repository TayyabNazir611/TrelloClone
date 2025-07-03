"use client";

import React, { useState } from "react";
import { MoreHorizontal, Edit3, Trash2 } from "lucide-react";
import { Card as UICard } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";

import { Card } from "../types/board";
import { useBoard } from "../hooks/use-board";
import { useDragDrop } from "../hooks/use-drag-drop";
interface BoardCardProps {
  card: Card;
  columnId: string;
  index: number;
}

export const BoardCard: React.FC<BoardCardProps> = ({
  card,
  columnId,
  index,
}) => {
  // console.log(card, columnId, index, "recieved");
  const { updateCard, deleteCard } = useBoard();
  const {
    draggedItem,
    handleDragStart: hookHandleDragStart,
    handleDragEnd,
  } = useDragDrop();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(card.title);
  const [editedDescription, setEditedDescription] = useState(
    card.description || ""
  );

  const handleUpdateCard = () => {
    if (
      editedTitle.trim() &&
      (editedTitle !== card.title || editedDescription !== card.description)
    ) {
      updateCard(card.id, {
        title: editedTitle.trim(),
        description: editedDescription.trim(),
      });
    }
    setIsEditing(false);
  };

  const handleDeleteCard = () => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      deleteCard(card.id);
    }
  };

  const onDragStart = (e: React.DragEvent) => {
    console.log(
      "Card drag started:",
      card.id,
      "from column:",
      columnId,
      "at index:",
      index
    );
    hookHandleDragStart(card.id, columnId, index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", card.id);
  };

  const onDragEnd = (e: React.DragEvent) => {
    console.log("Card drag ended:", card.id);
    handleDragEnd();
  };

  const isDragging = draggedItem.current?.id === card.id;

  return (
    <UICard
      className={`cursor-move transition-all duration-200 hover:shadow-md max-w-[500px] rounded-[8px] bg-[#ff3f2260] text-[#fff] backdrop-blur-[5px] px-2 py-3 ${
        isDragging ? "opacity-50 scale-95" : ""
      }`}
      style={{
        padding: "12px 8px",
      }}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-gray-900 leading-tight flex-1 pr-2 wrap-anywhere">
            {card.title}
          </h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-6 w-6 p-0 group-hover:opacity-100 transition-opacity bg-transparent border-none text-white cursor-pointer outline-none">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-[8px] px-1 py-2"
              style={{
                background: "white",
                padding: "8px 4px",
                border: "none",
                shadow: "2px 2px 10px #000",
              }}
            >
              <DropdownMenuItem
                onClick={() => setIsEditing(true)}
                style={{ color: "black", cursor: "pointer" }}
              >
                <Edit3 className="w-4 h-4 mr-2 " color="black" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDeleteCard}
                className="text-red-600 focus:text-red-600"
                style={{ color: "red", cursor: "pointer" }}
              >
                <Trash2 className="w-4 h-4 mr-2" color="red" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {card.description && (
          <p className="text-sm text-gray-600 leading-relaxed wrap-anywhere">
            {card.description}
          </p>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={isEditing}
        onOpenChange={setIsEditing}
        className="rounded-[12px] p-[12px] max-w-[500px] w-full"
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-600 text-black text-[16px]">
              Edit Card
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Title
              </label>
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                placeholder="Card title..."
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Description
              </label>
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Card description..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setIsEditing(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={handleUpdateCard}>Update Card</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </UICard>
  );
};
