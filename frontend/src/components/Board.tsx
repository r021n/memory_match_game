import { useGameStore } from "../store/gameStore";
import socket from "../socket";
import Card from "./Card";
import ScorePanel from "./ScorePanel";

export default function Board() {
  const { cards, currentPlayerId, roomId, mySocketId } = useGameStore();

  const isMyTurn = currentPlayerId === mySocketId;

  const handleFlip = (cardIndex: number) => {
    if (!isMyTurn) return;
    socket.emit("flip-card", { roomId, cardIndex });
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          🃏 Memory Match
        </h1>
        <p
          className={`text-center mb-4 text-sm ${
            isMyTurn ? "text-yellow-400" : "text-gray-400"
          }`}
        >
          {isMyTurn
            ? "✨ Giliranmu! Pilih kartu."
            : "⏳ Menunggu giliran pemain lain..."}
        </p>
        <ScorePanel />

        <div className="grid grid-cols-4 gap-3 max-w-md mx-auto">
          {cards.map((card, index) => (
            <Card
              key={card.id}
              card={card}
              index={index}
              disabled={!isMyTurn}
              onFlip={handleFlip}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
