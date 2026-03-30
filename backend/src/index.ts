import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { GameManager } from "./game/GameManager";
import { saveScore, getTopScores } from "./db";

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});

const gameManager = new GameManager();

app.get("/", (req, res) => {
  res.send("Memory Match Game Server is running!");
});

app.get("/scores", async (req, res) => {
  const topScores = await getTopScores();
  res.json(topScores);
});

io.on("connection", (socket) => {
  console.log("Pemain terhubung:", socket.id);

  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);

    const room = gameManager.joinRoom(roomId, socket.id, username);

    console.log(`${username} bergabung ke ${roomId}`);

    io.to(roomId).emit("room-update", {
      players: room.players,
      status: room.status,
    });
  });

  socket.on("start-game", ({ roomId }) => {
    const room = gameManager.startGame(roomId);

    if (!room) {
      socket.emit("game-error", {
        message: "Minimal 2 pemain untuk mulai game",
      });
      return;
    }

    const currentPlayer = gameManager.getCurrentPlayer(roomId);

    const hiddenCards = room.cards.map((card) => ({
      id: card.id,
      isMatched: false,
    }));

    console.log(`Game dimulai di ${roomId}!`);

    io.to(roomId).emit("game-start", {
      cards: hiddenCards,
      currentPlayerId: currentPlayer?.id,
    });
  });

  socket.on("flip-card", ({ roomId, cardIndex }) => {
    const result = gameManager.flipCard(roomId, socket.id, cardIndex);

    switch (result.type) {
      case "first-flip":
        io.to(roomId).emit("card-flipped", {
          cardIndex: result.cardIndex,
          value: result.value,
        });
        break;

      case "match": {
        io.to(roomId).emit("card-flipped", {
          cardIndex: result.cardIndices[1],
          value: result.value,
        });

        const currentPlayerAfterMatch = gameManager.getCurrentPlayer(roomId);

        setTimeout(() => {
          io.to(roomId).emit("cards-matched", {
            cardIndices: result.cardIndices,
            scores: result.scores,
            currentPlayerId: currentPlayerAfterMatch?.id,
          });

          if (result.isGameOver) {
            const room = gameManager.getRoom(roomId);
            if (room) {
              room.players.forEach((player) => {
                saveScore(player.username, roomId, player.score);
              });

              const winner = room.players.reduce((a, b) =>
                a.score > b.score ? a : b,
              );

              console.log(
                `Game selesai di ${roomId}! Pemenang: ${winner.username}`,
              );

              io.to(roomId).emit("game-over", {
                scores: result.scores,
                winner: winner.username,
              });
            }
          }
        }, 500);
        break;
      }

      case "no-match": {
        io.to(roomId).emit("card-flipped", {
          cardIndex: result.cardIndices[1],
          value: result.values[1],
        });

        const nextPlayer = gameManager.getCurrentPlayer(roomId);

        setTimeout(() => {
          gameManager.unlockRoom(roomId);

          io.to(roomId).emit("cards-unmatched", {
            cardIndices: result.cardIndices,
            currentPlayerId: nextPlayer?.id,
          });
        }, 1500);
        break;
      }

      case "error":
        socket.emit("game-error", { message: result.message });
        break;
    }
  });

  socket.on("leave-room", ({ roomId }) => {
    socket.leave(roomId);
    const room = gameManager.leaveRoom(roomId, socket.id);

    if (room) {
      io.to(roomId).emit("room-update", {
        players: room.players,
        status: room.status,
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("Pemain terputus:", socket.id);

    const result = gameManager.handleDisconnect(socket.id);
    if (result && result.room) {
      io.to(result.roomId).emit("room-update", {
        players: result.room.players,
        status: result.room.status,
      });
    }
  });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
