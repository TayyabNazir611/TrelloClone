"use client";

import { useState, useCallback } from "react";
import { useWebSocket } from "../contexts/websocket-context";
import { Card, Column } from "../types/board";

export const useBoard = () => {
  const { send, board } = useWebSocket();
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, any>>(
    new Map()
  );

  const createCard = useCallback(
    async (columnId: string, card: Omit<Card, "id" | "position">) => {
      const tempId = `temp-${Date.now()}`;
      const tempCard = {
        id: tempId,
        ...card,
        position:
          board?.columns.find((col) => col.id === columnId)?.cards.length || 0,
      };

      // Optimistic update
      setOptimisticUpdates((prev) =>
        new Map(prev).set(tempId, {
          type: "CREATE_CARD",
          columnId,
          card: tempCard,
        })
      );

      try {
        send({
          type: "CREATE_CARD",
          payload: { columnId, card },
        });

        // Clear optimistic update after successful send
        setTimeout(() => {
          setOptimisticUpdates((prev) => {
            const newMap = new Map(prev);
            newMap.delete(tempId);
            return newMap;
          });
        }, 1000);
      } catch (error) {
        console.error("Failed to create card:", error);
        // Rollback optimistic update
        setOptimisticUpdates((prev) => {
          const newMap = new Map(prev);
          newMap.delete(tempId);
          return newMap;
        });
      }
    },
    [send, board]
  );

  const updateCard = useCallback(
    async (cardId: string, updates: Partial<Card>) => {
      const rollbackKey = `update-${cardId}-${Date.now()}`;

      // Store current state for rollback
      const currentCard = board?.columns
        .flatMap((col) => col.cards)
        .find((card) => card.id === cardId);

      if (currentCard) {
        setOptimisticUpdates((prev) =>
          new Map(prev).set(rollbackKey, {
            type: "UPDATE_CARD",
            cardId,
            previousState: { ...currentCard },
          })
        );
      }

      try {
        send({
          type: "UPDATE_CARD",
          payload: { cardId, updates },
        });

        // Clear rollback data after successful send
        setTimeout(() => {
          setOptimisticUpdates((prev) => {
            const newMap = new Map(prev);
            newMap.delete(rollbackKey);
            return newMap;
          });
        }, 1000);
      } catch (error) {
        console.error("Failed to update card:", error);
        // Rollback would be handled by the WebSocket context
        setOptimisticUpdates((prev) => {
          const newMap = new Map(prev);
          newMap.delete(rollbackKey);
          return newMap;
        });
      }
    },
    [send, board]
  );

  const deleteCard = useCallback(
    async (cardId: string) => {
      try {
        send({
          type: "DELETE_CARD",
          payload: { cardId },
        });
      } catch (error) {
        console.error("Failed to delete card:", error);
      }
    },
    [send]
  );

  const moveCard = useCallback(
    async (
      cardId: string,
      fromColumnId: string,
      toColumnId: string,
      newPosition: number
    ) => {
      console.log(cardId, fromColumnId, toColumnId, newPosition, "moving..");
      try {
        console.log("triggered send")
        send({
          type: "MOVE_CARD",
          payload: {
            cardId: cardId,
            fromColumnId: fromColumnId,
            toColumnId: toColumnId,
            newPosition: newPosition,
          },
        });
      } catch (error) {
        console.error("Failed to move card:", error);
      }
    },
    [send]
  );

  const createColumn = useCallback(
    async (title: string) => {
      try {
        send({
          type: "CREATE_COLUMN",
          payload: { title },
        });
      } catch (error) {
        console.error("Failed to create column:", error);
      }
    },
    [send]
  );

  const updateColumn = useCallback(
    async (columnId: string, updates: Partial<Column>) => {
      try {
        send({
          type: "UPDATE_COLUMN",
          payload: { columnId, updates },
        });
      } catch (error) {
        console.error("Failed to update column:", error);
      }
    },
    [send]
  );

  const deleteColumn = useCallback(
    async (columnId: string) => {
      try {
        send({
          type: "DELETE_COLUMN",
          payload: { columnId },
        });
      } catch (error) {
        console.error("Failed to delete column:", error);
      }
    },
    [send]
  );

  return {
    board,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
    createColumn,
    updateColumn,
    deleteColumn,
    optimisticUpdates,
  };
};
