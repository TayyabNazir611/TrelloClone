"use client";

import React from "react";
import { WebSocketProvider } from "../contexts/websocket-context";
import { Board } from "../components/board";
export default function Home() {
  return (
    <WebSocketProvider>
      <Board />
    </WebSocketProvider>
  );
}
