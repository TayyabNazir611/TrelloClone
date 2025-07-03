"use client";

import { useRef, useCallback } from "react";
import { DragResult } from "../types/board";
import { DraggedItem } from "../types/item";

export const useDragDrop = () => {
  const draggedItem = useRef<DraggedItem | null>(null);

  const handleDragStart = useCallback(
    (cardId: string, columnId: string, index: number) => {
      console.log("setting", cardId, index, columnId);
      draggedItem.current = {
        id: cardId,
        type: "card",
        sourceIndex: index,
        sourceColumnId: columnId,
      };
    },
    []
  );

  const handleDragEnd = useCallback(() => {
    draggedItem.current = null;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (
      e: React.DragEvent,
      targetColumnId: string,
      targetIndex: number,
      onMove: (
        cardId: string,
        fromColumnId: string,
        toColumnId: string,
        newPosition: number
      ) => void
    ) => {
      e.preventDefault();

      const draggedItemcopy = draggedItem.current;

      console.log("dragged Item", draggedItem.current);

      if (!draggedItemcopy) return;

      const { id: cardId, sourceColumnId, sourceIndex } = draggedItemcopy;

      // Only move if position actually changed
      if (sourceColumnId !== targetColumnId || sourceIndex !== targetIndex) {
        console.log("actually");
        onMove(cardId, sourceColumnId, targetColumnId, targetIndex);
      }

      // onMove(cardId, sourceColumnId, targetColumnId, targetIndex);

      draggedItem.current = null;
    },
    [draggedItem]
  );

  return {
    draggedItem,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
  };
};
