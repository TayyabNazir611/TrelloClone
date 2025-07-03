"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Board, WebSocketMessage } from "../types/board";
interface WebSocketContextType {
  isConnected: boolean;
  send: (message: WebSocketMessage) => void;
  board: Board | null;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [board, setBoard] = useState<Board | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getWebSocketUrl = () => {
    if (typeof window === "undefined") return "ws://localhost:8080";

    const hostname = window.location.hostname;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

    // For WebContainer environment, replace the port in the hostname
    if (hostname.includes("webcontainer-api.io")) {
      const wsHostname = hostname.replace(/--3000--/, "--8080--");
      return `${protocol}//${wsHostname}/`;
    }

    // For local development
    return `${protocol}//${hostname}:8080`;
  };

  const connect = () => {
    try {
      const wsUrl = getWebSocketUrl();
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setIsConnected(true);
        // Clear any existing reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          handleMessage(message);
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setIsConnected(false);
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to connect WebSocket:", error);
      // Retry connection after 3 seconds
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    }
  };

  const handleMessage = (message: WebSocketMessage) => {
    switch (message.type) {
      case "BOARD_STATE":
        setBoard(message.payload);
        break;
      case "CARD_CREATED":
        setBoard((prev) => {
          if (!prev) return prev;
          const column = prev.columns.find(
            (col) => col.id === message.payload.columnId
          );
          if (column) {
            // Check if card already exists to prevent duplicates
            const cardExists = column.cards.some(
              (card) => card.id === message.payload.card.id
            );
            if (!cardExists) {
              const newBoard = { ...prev };
              const newColumn = newBoard.columns.find(
                (col) => col.id === message.payload.columnId
              );
              if (newColumn) {
                newColumn.cards.push(message.payload.card);
              }
              return newBoard;
            }
          }
          return prev;
        });
        break;
      case "CARD_UPDATED":
        setBoard((prev) => {
          if (!prev) return prev;
          const newBoard = { ...prev };
          for (const column of newBoard.columns) {
            const card = column.cards.find(
              (c) => c.id === message.payload.cardId
            );
            if (card) {
              Object.assign(card, message.payload.updates);
              break;
            }
          }
          return newBoard;
        });
        break;
      case "CARD_DELETED":
        setBoard((prev) => {
          if (!prev) return prev;
          const newBoard = { ...prev };
          const column = newBoard.columns.find(
            (col) => col.id === message.payload.columnId
          );
          if (column) {
            column.cards = column.cards.filter(
              (c) => c.id !== message.payload.cardId
            );
          }
          return newBoard;
        });
        break;
      case "CARD_MOVED":
        setBoard((prev) => {
          if (!prev) return prev;

          console.log("rev", prev);
          // Deep copy columns and cards
          const newColumns = prev.columns.map((col) => ({
            ...col,
            cards: [...col.cards],
          }));

          console.log("new columns", newColumns);

          const fromColumn = newColumns.find(
            (col) => col.id === message.payload.fromColumnId
          );

          console.log(fromColumn, "from");
          const toColumn = newColumns.find(
            (col) => col.id === message.payload.toColumnId
          );

          console.log(toColumn, "to");
          if (!fromColumn || !toColumn) return prev;

          const cardIndex = fromColumn.cards.findIndex(
            (c) => c.id === message.payload.cardId
          );

          if (cardIndex === -1) return prev;

          const [card] = fromColumn.cards.splice(cardIndex, 1);
          card.position = message.payload.newPosition;
          toColumn.cards.splice(message.payload.newPosition, 0, card);

          // Reassign positions
          fromColumn.cards.forEach((c, index) => (c.position = index));
          toColumn.cards.forEach((c, index) => (c.position = index));

          return {
            ...prev,
            columns: newColumns,
          };
        });
        break;

      case "COLUMN_CREATED":
        setBoard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            columns: [...prev.columns, message.payload.column],
          };
        });
        break;
      case "COLUMN_UPDATED":
        setBoard((prev) => {
          if (!prev) return prev;
          const newBoard = { ...prev };
          const column = newBoard.columns.find(
            (col) => col.id === message.payload.columnId
          );
          if (column) {
            Object.assign(column, message.payload.updates);
          }
          return newBoard;
        });
        break;
      case "COLUMN_DELETED":
        setBoard((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            columns: prev.columns.filter(
              (col) => col.id !== message.payload.columnId
            ),
          };
        });
        break;
      case "ERROR":
        console.error("WebSocket error:", message.payload.message);
        break;
    }
  };

  const send = (message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      console.log("message", message);
      wsRef.current.send(JSON.stringify(message));
      console.log("message sent");
    } else {
      console.error("WebSocket is not connected");
    }
  };

  const reconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    connect();
  };

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, send, board, reconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
};
