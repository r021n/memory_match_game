import { Card, Player, GameRoom, FlipResult } from "../types";

const CARD_VALUES = ["🍎", "🍊", "🍋", "🍇", "🍓", "🍒", "🥝", "🍌"];

export class GameManager {
  private rooms: Map<string, GameRoom> = new Map();
  private playerRooms: Map<string, string> = new Map();

  joinRoom(roomId: string, playerId: string, username: string): GameRoom {
    let room = this.rooms.get(roomId);

    if (!room) {
      room = {
        id: roomId,
        players: [],
        cards: [],
        currentPlayerIndex: 0,
        flippedCardIndices: [],
        status: "waiting",
        isLocked: false,
      };
      this.rooms.set(roomId, room);
    }

    const existing = room.players.find((p) => p.id === playerId);
    if (!existing) {
      room.players.push({ id: playerId, username, score: 0 });
    }

    this.playerRooms.set(playerId, roomId);

    return room;
  }

  leaveRoom(roomId: string, playerId: string): GameRoom | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.players = room.players.filter((p) => p.id !== playerId);
    this.playerRooms.delete(playerId);

    if (room.players.length === 0) {
      this.rooms.delete(roomId);
      return null;
    }

    if (room.currentPlayerIndex >= room.players.length) {
      room.currentPlayerIndex = 0;
    }

    return room;
  }

  startGame(roomId: string): GameRoom | null {
    const room = this.rooms.get(roomId);
    if (!room || room.players.length < 2) return null;

    room.cards = this.generateDeck();
    room.currentPlayerIndex = 0;
    room.flippedCardIndices = [];
    room.status = "playing";
    room.isLocked = false;

    room.players.forEach((p) => (p.score = 0));

    return room;
  }

  flipCard(roomId: string, playerId: string, cardIndex: number): FlipResult {
    const room = this.rooms.get(roomId);

    if (!room || room.status !== "playing") {
      return { type: "error", message: "Game belum dimulai" };
    }

    if (room.isLocked) {
      return { type: "error", message: "Tunggu sebentar..." };
    }

    const currentPlayer = room.players[room.currentPlayerIndex];
    if (currentPlayer.id !== playerId) {
      return { type: "error", message: "Bukan giliranmu" };
    }

    const card = room.cards[cardIndex];
    if (!card || card.isMatched) {
      return { type: "error", message: "Kartu tidak valid" };
    }

    if (room.flippedCardIndices.includes(cardIndex)) {
      return { type: "error", message: "Kartu sudah terbuka" };
    }

    room.flippedCardIndices.push(cardIndex);

    if (room.flippedCardIndices.length === 1) {
      return {
        type: "first-flip",
        cardIndex,
        value: card.value,
      };
    }

    const [firstIndex, secondIndex] = room.flippedCardIndices;
    const firstCard = room.cards[firstIndex];
    const secondCard = room.cards[secondIndex];

    room.flippedCardIndices = [];

    if (firstCard.value === secondCard.value) {
      firstCard.isMatched = true;
      secondCard.isMatched = true;
      currentPlayer.score += 1;

      const scores: Record<string, number> = {};
      room.players.forEach((p) => (scores[p.username] = p.score));

      const isGameOver = room.cards.every((c) => c.isMatched);
      if (isGameOver) {
        room.status = "finished";
      }

      return {
        type: "match",
        cardIndices: [firstIndex, secondIndex],
        value: firstCard.value,
        scores,
        isGameOver,
      };
    } else {
      room.isLocked = true;
      room.currentPlayerIndex =
        (room.currentPlayerIndex + 1) % room.players.length;

      return {
        type: "no-match",
        cardIndices: [firstIndex, secondIndex],
        values: [firstCard.value, secondCard.value],
      };
    }
  }

  unlockRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) room.isLocked = false;
  }

  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  getCurrentPlayer(roomId: string): Player | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    return room.players[room.currentPlayerIndex] || null;
  }

  handleDisconnect(
    playerId: string,
  ): { roomId: string; room: GameRoom | null } | null {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return null;

    this.playerRooms.delete(playerId);
    const room = this.leaveRoom(roomId, playerId);
    return { roomId, room };
  }

  private generateDeck(): Card[] {
    const values = [...CARD_VALUES, ...CARD_VALUES];
    this.shuffleArray(values);

    return values.map((value, index) => ({
      id: index,
      value,
      isMatched: false,
    }));
  }

  private shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}
