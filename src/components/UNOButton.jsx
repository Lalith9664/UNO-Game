import React from 'react';
import { Volume2 } from 'lucide-react';

export const UNOButton = ({
  isCurrentTurn = false,
  handSize = 0,
  hasDeclaredUno = false,
  onDeclare
}) => {
  // Only display the button when player is near the 1-card limit (handSize of 1 or 2)
  const isVisible = isCurrentTurn && (handSize === 1 || handSize === 2);

  if (!isVisible) return null;

  return (
    <div className="flex flex-col items-center justify-center animate-bounce-slow">
      <button
        onClick={onDeclare}
        disabled={hasDeclaredUno}
        className={`
          relative px-8 py-4 landscape:px-4 landscape:py-2 rounded-full font-black text-2xl landscape:text-sm tracking-widest uppercase transition-all duration-300
          border-b-4 shadow-xl select-none active:translate-y-1 active:border-b-0
          ${hasDeclaredUno
            ? 'bg-gradient-to-r from-emerald-500 to-green-600 border-green-700 text-white shadow-green-500/20'
            : 'bg-gradient-to-r from-red-500 to-rose-600 border-red-700 text-white animate-pulse shadow-red-500/40 ring-4 ring-red-500/20'}
        `}
      >
        {hasDeclaredUno ? 'UNO DECLARED! 📢' : 'DECLARE UNO! 🚨'}
        
        {/* Glowing ring overlay */}
        {!hasDeclaredUno && (
          <span className="absolute -inset-1 rounded-full border-2 border-red-500/40 animate-ping pointer-events-none"></span>
        )}
      </button>
      
      {!hasDeclaredUno && (
        <span className="text-[10px] font-bold text-red-400 bg-red-950/40 border border-red-900/30 px-2 py-0.5 rounded mt-2 landscape:mt-1 uppercase tracking-widest">
          Press before ending turn!
        </span>
      )}
    </div>
  );
};

export default UNOButton;
