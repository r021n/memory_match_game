import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import socket from "../socket";

export default function Lobby() {
  const [inputName, setInputName] = useState("");
  const [inputRoom, setInputRoom] = useState("");

  const {
    // username,
    roomId,
    players,
    status,
    setUsername,
    setRoomId,
    setStatus,
  } = useGameStore();

  const inLobby = status === "lobby";

  const handleJoin = () => {
    const name = inputName.trim();
    const room = inputRoom.trim();
    if (!name || !room) return;

    setUsername(name);
    setRoomId(room);
    setStatus("lobby");

    socket.emit("join-room", { roomId: room, username: name });
  };

  const handleStart = () => {
    socket.emit("start-game", { roomId });
  };

  if (!inLobby) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <h1 className="text-3xl font-bold text-white text-center mb-2">
            🃏 Memory Match
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Temukan pasangan kartu bersama temanmu!
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Username
              </label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Masukkan nama kamu"
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg
                           border border-gray-600 focus:border-blue-500
                           focus:outline-none placeholder-gray-500"
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm mb-1">
                Room ID
              </label>
              <input
                type="text"
                value={inputRoom}
                onChange={(e) => setInputRoom(e.target.value)}
                placeholder="Masukkan nama room"
                className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg
                           border border-gray-600 focus:border-blue-500
                           focus:outline-none placeholder-gray-500"
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />
            </div>

            <button
              onClick={handleJoin}
              disabled={!inputName.trim() || !inputRoom.trim()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700
                         disabled:bg-gray-600 disabled:cursor-not-allowed
                         text-white font-semibold rounded-lg transition-colors"
            >
              Masuk Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-bold text-white text-center mb-1">
          Room: {roomId}
        </h2>
        <p className="text-gray-400 text-center mb-6">
          Menunggu pemain lain...
        </p>

        <div className="mb-6">
          <h3 className="text-gray-300 text-sm mb-3">
            Pemain ({players.length}):
          </h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 bg-gray-700 px-4 py-3 rounded-lg"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {player.username.charAt(0).toUpperCase()}
                </div>

                <span className="text-white">
                  {player.username}
                  {player.id === socket.id && (
                    <span className="text-blue-400 text-sm ml-2">(kamu)</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={players.length < 2}
          className="w-full py-3 bg-green-600 hover:bg-green-700
                     disabled:bg-gray-600 disabled:cursor-not-allowed
                     text-white font-semibold rounded-lg transition-colors"
        >
          {players.length < 2
            ? `Butuh minimal 2 pemain (${players.length}/2)`
            : "Mulai Game! 🚀"}
        </button>
      </div>
    </div>
  );
}
