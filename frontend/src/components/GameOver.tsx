import { useGameStore } from "../store/gameStore";
import socket from "../socket";

export default function GameOver() {
  const { finalScores, winner, username, resetGame, roomId } = useGameStore();

  const isWinner = winner === username;

  const sortedScores = Object.entries(finalScores).sort(
    ([, a], [, b]) => b - a,
  );

  const handlePlayAgain = () => {
    resetGame();
  };

  const handleRematch = () => {
    resetGame();
    useGameStore.getState().setUsername(username);
    useGameStore.getState().setRoomId(roomId);
    useGameStore.getState().setStatus("lobby");
    socket.emit("join-room", { roomId, username });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl text-center">
        <div className="text-6xl mb-4">{isWinner ? "🏆" : "👏"}</div>
        <h1 className="text-3xl font-bold text-white mb-2">Game Selesai!</h1>
        <p className="text-xl mb-6">
          {isWinner ? (
            <span></span>
          ) : (
            <span className="text-gray-300">
              Pemenang:{" "}
              <span className="text-yellow-400 font-bold">{winner}</span>
            </span>
          )}
        </p>

        <div className="mb-8 space-y-2">
          {sortedScores.map(([name, score], index) => (
            <div
              key={name}
              className={`
                flex justify-between items-center px-4 py-3 rounded-lg
                ${
                  index === 0
                    ? "bg-yellow-500/20 border border-yellow-500/50"
                    : "bg-gray-700"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                </span>
                <span
                  className={`${
                    name === username ? "text-blue-400" : "text-white"
                  }`}
                >
                  {name} {name === username && "(kamu)"}
                </span>
              </div>
              <span className="text-white font-bold text-lg">
                {score} pasang
              </span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleRematch}
            className="w-full py-3 bg-green-600 hover:bg-green-700
                       text-white font-semibold rounded-lg transition-colors"
          >
            Main Lagi (Room Sama) 🔄
          </button>
          <button
            onClick={handlePlayAgain}
            className="w-full py-3 bg-gray-600 hover:bg-gray-700
                       text-white font-semibold rounded-lg transition-colors"
          >
            Kembali ke Menu
          </button>
        </div>
      </div>
    </div>
  );
}
