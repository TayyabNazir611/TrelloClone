// Simple WebSocket server for real-time collaboration
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

const wss = new WebSocket.Server({ port: 8080 });

// In-memory storage
let boardData = {
  id: "main-board",
  title: "My Trello Board",
  columns: [
    {
      id: "todo",
      title: "To Do",
      cards: [
        {
          id: uuidv4(),
          title: "Welcome to Trello Clone",
          description: "Start by creating your first card!",
          position: 0,
        },
      ],
    },
  ],
};

const clients = new Set();

wss.on("connection", (ws) => {
  console.log("New client connected");
  clients.add(ws);

  // Send current board state to new client
  ws.send(
    JSON.stringify({
      type: "BOARD_STATE",
      payload: boardData,
    })
  );

  ws.on("message", (message) => {
    try {
      console.log("message recieved", message);
      const data = JSON.parse(message);

      switch (data.type) {
        case "CREATE_CARD":
          handleCreateCard(data.payload);
          break;
        case "UPDATE_CARD":
          handleUpdateCard(data.payload);
          break;
        case "DELETE_CARD":
          console.log("payo", data?.payload);
          handleDeleteCard(data.payload);
          break;
        case "MOVE_CARD":
          handleMoveCard(data.payload);
          break;
        case "CREATE_COLUMN":
          handleCreateColumn(data.payload);
          break;
        case "UPDATE_COLUMN":
          handleUpdateColumn(data.payload);
          break;
        case "DELETE_COLUMN":
          handleDeleteColumn(data.payload);
          break;
      }
    } catch (error) {
      console.error("Error processing message:", error);
      ws.send(
        JSON.stringify({
          type: "ERROR",
          payload: { message: "Invalid message format" },
        })
      );
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    clients.delete(ws);
  });
});

function broadcast(message) {
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

function handleCreateCard(payload) {
  const { columnId, card } = payload;
  const column = boardData.columns.find((col) => col.id === columnId);

  if (column) {
    const newCard = {
      id: uuidv4(),
      title: card.title,
      description: card.description || "",
      position: column.cards.length,
    };

    column.cards.push(newCard);

    broadcast({
      type: "CARD_CREATED",
      payload: { columnId, card: newCard },
    });
  }
}

function handleUpdateCard(payload) {
  const { cardId, updates } = payload;

  for (const column of boardData.columns) {
    const card = column.cards.find((c) => c.id === cardId);
    if (card) {
      Object.assign(card, updates);
      broadcast({
        type: "CARD_UPDATED",
        payload: { cardId, updates },
      });
      break;
    }
  }
}

function handleDeleteCard(payload) {
  const { cardId } = payload;

  for (const column of boardData.columns) {
    const cardIndex = column.cards.findIndex((c) => c.id === cardId);
    if (cardIndex !== -1) {
      column.cards.splice(cardIndex, 1);
      // Reorder positions
      column.cards.forEach((card, index) => {
        card.position = index;
      });

      broadcast({
        type: "CARD_DELETED",
        payload: { cardId, columnId: column.id },
      });
      break;
    }
  }
}

// function handleMoveCard(payload) {
//   console.log("payload", payload);
//   const { cardId, fromColumnId, toColumnId, newPosition } = payload;

//   console.log(cardId, fromColumnId, toColumnId, newPosition, "dragged");
//   const fromColumn = boardData.columns.find((col) => col.id === fromColumnId);
//   const toColumn = boardData.columns.find((col) => col.id === toColumnId);

//   if (fromColumn && toColumn) {
//     const cardIndex = fromColumn.cards.findIndex((c) => c.id === cardId);

//     if (cardIndex !== -1) {
//       const [card] = fromColumn.cards.splice(cardIndex, 1);

//       // Update positions in source column
//       fromColumn.cards.forEach((c, index) => {
//         c.position = index;
//       });

//       // Insert card at new position
//       card.position = newPosition;
//       toColumn.cards.splice(newPosition, 0, card);

//       // Update positions in destination column
//       toColumn.cards.forEach((c, index) => {
//         c.position = index;
//       });

//       broadcast({
//         type: "CARD_MOVED",
//         payload: { cardId, fromColumnId, toColumnId, newPosition },
//       });
//     }
//   }
// }
function handleMoveCard(payload) {
  console.log("payload", payload);
  const { cardId, fromColumnId, toColumnId, newPosition } = payload;

  setBoardData((prev) => {
    if (!prev) return prev;

    const columnsCopy = prev.columns.map((col) => ({
      ...col,
      cards: [...col.cards],
    }));

    const fromColumn = columnsCopy.find((col) => col.id === fromColumnId);
    const toColumn = columnsCopy.find((col) => col.id === toColumnId);

    if (fromColumn && toColumn) {
      const cardIndex = fromColumn.cards.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return prev;

      const [card] = fromColumn.cards.splice(cardIndex, 1);

      fromColumn.cards.forEach((c, idx) => (c.position = idx));

      card.position = newPosition;
      toColumn.cards.splice(newPosition, 0, card);

      toColumn.cards.forEach((c, idx) => (c.position = idx));

      // Send to others via WebSocket/broadcast
      broadcast({
        type: "CARD_MOVED",
        payload: { cardId, fromColumnId, toColumnId, newPosition },
      });

      return {
        ...prev,
        columns: columnsCopy,
      };
    }

    return prev;
  });
}

function handleCreateColumn(payload) {
  const { title } = payload;
  const newColumn = {
    id: uuidv4(),
    title,
    cards: [],
  };

  boardData.columns.push(newColumn);

  broadcast({
    type: "COLUMN_CREATED",
    payload: { column: newColumn },
  });
}

function handleUpdateColumn(payload) {
  const { columnId, updates } = payload;
  const column = boardData.columns.find((col) => col.id === columnId);

  if (column) {
    Object.assign(column, updates);
    broadcast({
      type: "COLUMN_UPDATED",
      payload: { columnId, updates },
    });
  }
}

function handleDeleteColumn(payload) {
  const { columnId } = payload;
  const columnIndex = boardData.columns.findIndex((col) => col.id === columnId);

  if (columnIndex !== -1) {
    boardData.columns.splice(columnIndex, 1);
    broadcast({
      type: "COLUMN_DELETED",
      payload: { columnId },
    });
  }
}

console.log("WebSocket server running on port 8080");
