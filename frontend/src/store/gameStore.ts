import { create } from "zustand";

export interface ClientCard {
  id: number;
  value: string | null;
  isMatched: boolean;
  isFlipped: boolean;
}

export interface Player {
  id: string;
  username: string;
  score: number;
}

interface GameState {
  mySocketId: string;
  username: string;
  roomId: string;

  players: Player[];
  cards: ClientCard[];
  currentPlayerId: string;
  status: "idle" | "lobby" | "playing" | "finished";

  winner: string;
  finalScores: Record<string, number>;

  setMySocketId: (id: string) => void;
  setUsername: (name: string) => void;
  setRoomId: (id: string) => void;
  setPlayers: (players: Player[]) => void;
  setStatus: (status: GameState["status"]) => void;
  setCurrentPlayerId: (id: string) => void;

  initCards: (cards: { id: number; isMatched: boolean }[]) => void;
  flipCard: (cardIndex: number, value: string) => void;
  matchCards: (
    cardIndices: [number, number],
    scores: Record<string, number>,
  ) => void;
  unmatchCards: (cardIndices: [number, number]) => void;
  setGameOver: (scores: Record<string, number>, winner: string) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  mySocketId: "",
  username: "",
  roomId: "",
  players: [],
  cards: [],
  currentPlayerId: "",
  status: "idle",
  winner: "",
  finalScores: {},

  setMySocketId: (id) => set({ mySocketId: id }),
  setUsername: (name) => set({ username: name }),
  setRoomId: (id) => set({ roomId: id }),
  setPlayers: (players) => set({ players }),
  setStatus: (status) => set({ status }),
  setCurrentPlayerId: (id) => set({ currentPlayerId: id }),

  initCards: (cards) =>
    set({
      cards: cards.map((c) => ({
        id: c.id,
        value: null,
        isMatched: false,
        isFlipped: false,
      })),
    }),

  flipCard: (cardIndex, value) =>
    set((state) => ({
      cards: state.cards.map((card, i) =>
        i === cardIndex ? { ...card, value, isFlipped: true } : card,
      ),
    })),

  matchCards: (cardIndices, scores) =>
    set((state) => ({
      cards: state.cards.map((card, i) =>
        cardIndices.includes(i)
          ? { ...card, isMatched: true, isFlipped: true }
          : card,
      ),
      players: state.players.map((p) => ({
        ...p,
        score: scores[p.username] ?? p.score,
      })),
    })),

  unmatchCards: (cardIndices) =>
    set((state) => ({
      cards: state.cards.map((card, i) =>
        cardIndices.includes(i)
          ? { ...card, value: null, isFlipped: false }
          : card,
      ),
    })),

  setGameOver: (scores, winner) =>
    set({ finalScores: scores, winner, status: "finished" }),

  resetGame: () =>
    set({
      players: [],
      cards: [],
      currentPlayerId: "",
      status: "idle",
      winner: "",
      finalScores: {},
      roomId: "",
    }),
}));
