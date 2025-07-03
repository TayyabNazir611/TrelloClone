"use client";

import React, { useState } from "react";
import { MoreHorizontal, Edit3, Trash2 } from "lucide-react";
import { Card as UICard } from "./ui/card";
// import { Button } from "./ui/button";
import { Modal, Button, Form } from "react-bootstrap";

// import { Input } from "./ui/input";
// import { Textarea } from "./ui/textarea";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "../components/ui/dialog";

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
      className={`cursor-move transition-all duration-200 shadow-[14px] shadow-[#00000050] max-w-[500px] rounded-[8px] bg-[#f8f8f860] text-[#000] backdrop-blur-[30px] px-2 py-3 ${
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
              <button className="h-6 w-6 p-0 group-hover:opacity-100 transition-opacity bg-transparent border-none text-black cursor-pointer outline-none">
                <MoreHorizontal className="w-3 h-3" />
              </button>
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
      <Modal
        show={isEditing}
        onHide={() => setIsEditing(false)}
        centered
        size="sm"
      >
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 text-dark">Edit Card</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="text-sm fw-medium text-muted">
                Title
              </Form.Label>
              <Form.Control
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
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
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Card description..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateCard}>
            Update Card
          </Button>
        </Modal.Footer>
      </Modal>
    </UICard>
  );
};
