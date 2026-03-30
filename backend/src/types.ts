export interface Card {
  id: number;
  value: string;
  isMatched: boolean;
}

export interface Player {
  id: string;
  username: string;
  score: number;
}

export interface GameRoom {
  id: string;
  players: Player[];
  cards: Card[];
  currentPlayerIndex: number;
  flippedCardIndices: number[];
  status: "waiting" | "playing" | "finished";
  isLocked: boolean;
}

export type FlipResult =
  | {
      type: "first-flip";
      cardIndex: number;
      value: string;
    }
  | {
      type: "match";
      cardIndices: [number, number];
      value: string;
      scores: Record<string, number>;
      isGameOver: boolean;
    }
  | {
      type: "no-match";
      cardIndices: [number, number];
      values: [string, string];
    }
  | {
      type: "error";
      message: string;
    };
