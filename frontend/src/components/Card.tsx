import type { ClientCard } from "../store/gameStore";

interface CardProps {
  card: ClientCard;
  index: number;
  disabled: boolean;
  onFlip: (index: number) => void;
}

export default function Card({ card, index, disabled, onFlip }: CardProps) {
  const isRevealed = card.isFlipped || card.isMatched;

  const handleClick = () => {
    if (disabled || card.isMatched || card.isFlipped) return;
    onFlip(index);
  };

  return (
    <div className="perspective-[600px]" onClick={handleClick}>
      <div
        className={`
          relative w-full aspect-square cursor-pointer
          transition-transform duration-500
          transform-3d
          ${isRevealed ? "transform-[rotateY(180deg)]" : ""}
          ${disabled && !isRevealed ? "cursor-not-allowed" : ""}
        `}
      >
        <div
          className={`
            absolute inset-0 backface-hidden rounded-xl
            flex items-center justify-center text-3xl
            border-2 transition-colors duration-200
            ${
              card.isMatched
                ? "border-transparent bg-transparent"
                : "bg-linear-to-br from-blue-600 to-blue-800 border-blue-500 hover:border-blue-300 shadow-lg"
            }
          `}
        >
          {!card.isMatched && <span>❓</span>}
        </div>

        <div
          className={`
            absolute inset-0 backface-hidden transform-[rotateY(180deg)]
            rounded-xl flex items-center justify-center text-4xl
            border-2 transition-colors duration-200
            ${
              card.isMatched
                ? "bg-green-900/50 border-green-500"
                : "bg-gray-700 border-yellow-500"
            }
          `}
        >
          {card.value}
        </div>
      </div>
    </div>
  );
}
