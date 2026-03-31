import { useGameStore } from "../store/gameStore";
import socket from "../socket";

export default function ScorePanel() {
  const { players, currentPlayerId } = useGameStore();

  return (
    <div className="flex flex-wrap justify-center gap-4 mb-6">
      {players.map((player) => {
        const isMe = player.id === socket.id;
        const isTurn = player.id === currentPlayerId;

        return (
          <div
            key={player.id}
            className={`
              px-5 py-3 rounded-xl border-2 min-w-35 text-center
              transition-all duration-300
              ${
                isTurn
                  ? "bg-yellow-500/20 border-yellow-400 scale-105"
                  : "bg-gray-800 border-gray-700"
              }
            `}
          >
            <div className="text-sm text-gray-400">
              {player.username}
              {isMe && <span className="text-blue-400"> (kamu)</span>}
            </div>
            <div className="text-2xl font-bold text-white">{player.score}</div>
            {isTurn && (
              <div className="text-xs text-yellow-400 mt-1">⭐ Giliran</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
