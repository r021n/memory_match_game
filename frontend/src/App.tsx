import { useEffect } from "react";
import socket from "./socket";
import { useGameStore } from "./store/gameStore";
import Lobby from "./components/Lobby";
import Board from "./components/Board";
import GameOver from "./components/GameOver";

export default function App() {
  const {
    status,
    setMySocketId,
    setPlayers,
    setStatus,
    setCurrentPlayerId,
    initCards,
    flipCard,
    matchCards,
    unmatchCards,
    setGameOver,
  } = useGameStore();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Terhubung ke server:", socket.id);
      if (socket.id) {
        setMySocketId(socket.id);
      }
    });

    socket.on("room-update", ({ players, status: roomStatus }) => {
      setPlayers(players);

      if (roomStatus === "playing") {
        setStatus("playing");
      }
    });

    socket.on("game-start", ({ cards, currentPlayerId }) => {
      initCards(cards);
      setCurrentPlayerId(currentPlayerId);
      setStatus("playing");
    });

    socket.on("card-flipped", ({ cardIndex, value }) => {
      flipCard(cardIndex, value);
    });

    socket.on("cards-matched", ({ cardIndices, scores, currentPlayerId }) => {
      matchCards(cardIndices, scores);
      setCurrentPlayerId(currentPlayerId);
    });

    socket.on("cards-unmatched", ({ cardIndices, currentPlayerId }) => {
      unmatchCards(cardIndices);
      setCurrentPlayerId(currentPlayerId);
    });

    socket.on("game-over", ({ scores, winner }) => {
      setGameOver(scores, winner);
    });

    socket.on("game-error", ({ message }) => {
      console.warn("Game error:", message);
    });

    return () => {
      socket.off("connect");
      socket.off("room-update");
      socket.off("game-start");
      socket.off("card-flipped");
      socket.off("cards-matched");
      socket.off("cards-unmatched");
      socket.off("game-over");
      socket.off("game-error");
    };
  }, []);

  switch (status) {
    case "playing":
      return <Board />;
    case "finished":
      return <GameOver />;
    default:
      return <Lobby />;
  }
}
