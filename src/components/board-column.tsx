"use client";

import React, { useState } from "react";
import { Plus, MoreHorizontal, Edit3, Trash2 } from "lucide-react";
// import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card as UICard } from "./ui/card";
import { Modal, Form, Button } from "react-bootstrap";
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
    <UICard className="w-80 flex-shrink-0 bg-gray-50 border-0 shadow-sm w-fit">
      <div className="p-4 space-x-[16px]">
        {/* Column Header */}
        <div className="flex items-center justify-between gap-[16px]">
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

          <div className="flex items-center space-x-[8px]">
            <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
              {column.cards.length} Tasks
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-6 w-6 p-0 group-hover:opacity-100 transition-opacity bg-transparent border-none text-black cursor-pointer outline-none">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-[8px] px-1 py-2"
                style={{
                  background: "white",
                  padding: "8px 4px",
                  border: "none",
                }}
              >
                <DropdownMenuItem
                  onClick={() => setIsEditingTitle(true)}
                  style={{ color: "black", cursor: "pointer" }}
                >
                  <Edit3 className="w-4 h-4 mr-2" color="black" />
                  Edit title
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDeleteColumn}
                  className="text-red-600 focus:text-red-600"
                  style={{ color: "red", cursor: "pointer" }}
                >
                  <Trash2 className="w-4 h-4 mr-2" color="red" />
                  Delete column
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Cards */}
        <div
          className="space-y-[12px] min-h-[200px]"
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

        <Button
          onClick={() => setIsAddingCard(true)}
          // variant="ghost"
          className="w-fit mt-[12px] px-[24px] py-[12px] flex items-center space-x-2 p-[8px] rounded-[8px] bg-[#3B82F6] text-[#fff] outline-none border-none cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add a card</span>
        </Button>
      </div>

      <Modal
        show={isAddingCard}
        onHide={() => setIsAddingCard(false)}
        centered
        size="sm"
      >
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 text-dark">Add Card</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="text-sm fw-medium text-muted">
                Title
              </Form.Label>
              <Form.Control
                type="text"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                placeholder="Card title..."
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-sm fw-medium text-muted">
                Description
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={newCardDesc}
                onChange={(e) => setNewCardDesc(e.target.value)}
                placeholder="Card description..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setIsAddingCard(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddCard}>
            Add Card
          </Button>
        </Modal.Footer>
      </Modal>
    </UICard>
  );
};
