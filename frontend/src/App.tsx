import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

function App() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on("connect", () => {
      setConnected(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Memory Match Game
        </h1>
        <p
          className={`text-lg ${connected ? "text-green-400" : "text-red-400"}`}
        >
          {connected ? "Terhubung ke server ✅" : "Tidak terhubung ❌"}
        </p>
      </div>
    </div>
  );
}

export default App;
