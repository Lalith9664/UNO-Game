import React, { useState, useEffect, useRef } from 'react';

/**
 * Full-screen card shuffling animation that plays when a match starts.
 * Shows UNO cards flying, shuffling, and dealing before the game board appears.
 */
const ShuffleAnimation = ({ playerCount = 4, onComplete }) => {
  const [phase, setPhase] = useState('gather');    // gather → shuffle → deal → done

  const cardColors = [
    'from-red-500 to-red-700',
    'from-blue-500 to-blue-700',
    'from-emerald-500 to-emerald-700',
    'from-amber-400 to-yellow-500',
    'from-red-500 to-red-700',
    'from-blue-500 to-blue-700',
    'from-emerald-500 to-emerald-700',
    'from-amber-400 to-yellow-500',
    'from-red-500 to-red-700',
    'from-blue-500 to-blue-700',
    'from-emerald-500 to-emerald-700',
    'from-amber-400 to-yellow-500',
  ];

  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const timers = [];
    // Phase 1: Cards gather to center (already running via CSS)
    timers.push(setTimeout(() => setPhase('shuffle'), 800));
    // Phase 2: Shuffle riffle
    timers.push(setTimeout(() => setPhase('deal'), 2200));
    // Phase 3: Deal out
    timers.push(setTimeout(() => setPhase('done'), 3400));
    // Complete
    timers.push(setTimeout(() => onCompleteRef.current?.(), 3800));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-red-600/15 blur-[100px] animate-pulse"></div>
      <div className="absolute w-[300px] h-[300px] rounded-full bg-amber-500/10 blur-[80px] animate-pulse" style={{ animationDelay: '0.5s' }}></div>

      {/* Title text */}
      <div className={`absolute top-[12%] transition-all duration-700 ${
        phase === 'done' ? 'opacity-0 -translate-y-8' : 'opacity-100'
      }`}>
        <h2 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 tracking-widest italic">
          {phase === 'gather' && 'SHUFFLING...'}
          {phase === 'shuffle' && 'SHUFFLING...'}
          {phase === 'deal' && 'DEALING CARDS...'}
          {phase === 'done' && 'LET\'S GO!'}
        </h2>
      </div>

      {/* Card stack / shuffle area */}
      <div className="relative w-[100px] h-[140px] sm:w-[120px] sm:h-[168px]">
        {cardColors.map((gradient, i) => {
          const total = cardColors.length;
          // Phase-based positioning
          let style = {};
          let extraClass = '';

          if (phase === 'gather') {
            // Cards fly in from random positions
            const angle = (i / total) * 360;
            const radius = 250;
            const startX = Math.cos((angle * Math.PI) / 180) * radius;
            const startY = Math.sin((angle * Math.PI) / 180) * radius;
            style = {
              transform: `translate(${startX}px, ${startY}px) rotate(${angle}deg) scale(0.6)`,
              opacity: 0.7,
              transition: `all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.04}s`,
            };
          } else if (phase === 'shuffle') {
            // Riffle shuffle — cards alternate left/right rapidly  
            const side = i % 2 === 0 ? -1 : 1;
            const shuffleIndex = Math.floor(i / 2);
            const yOffset = -shuffleIndex * 2;
            const xOffset = side * (25 + Math.random() * 15);
            const rotation = side * (8 + Math.random() * 12);
            style = {
              transform: `translate(${xOffset}px, ${yOffset}px) rotate(${rotation}deg)`,
              opacity: 1,
              transition: `all 0.3s ease-in-out ${(i % 4) * 0.08}s`,
              animation: `shuffleRiffle 0.4s ease-in-out ${i * 0.06}s infinite alternate`,
            };
          } else if (phase === 'deal') {
            // Cards fly out to player positions
            const playerIdx = i % playerCount;
            const angle = (playerIdx / playerCount) * 360 - 90;
            const radius = 160;
            const targetX = Math.cos((angle * Math.PI) / 180) * radius;
            const targetY = Math.sin((angle * Math.PI) / 180) * radius;
            style = {
              transform: `translate(${targetX}px, ${targetY}px) rotate(${angle + 180}deg) scale(0.5)`,
              opacity: 0,
              transition: `all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${i * 0.08}s`,
            };
          } else {
            style = {
              transform: 'scale(0) rotate(720deg)',
              opacity: 0,
              transition: 'all 0.4s ease-in',
            };
          }

          return (
            <div
              key={i}
              className={`absolute inset-0 rounded-lg sm:rounded-xl border-2 border-amber-400/60 overflow-hidden shadow-lg ${extraClass}`}
              style={{ ...style, zIndex: total - i }}
            >
              {/* Card face — UNO back design */}
              <div className={`w-full h-full bg-gradient-to-br ${gradient} relative`}>
                <div className="absolute inset-0 bg-gradient-to-br from-red-800 via-red-900 to-red-950 opacity-80"></div>
                <div className="absolute inset-[3px] sm:inset-1 border border-amber-400/30 rounded-md sm:rounded-lg"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] sm:text-xs font-black text-amber-400 italic rotate-[-25deg] opacity-90 tracking-wider">
                    UNO
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Player count indicator */}
      <div className={`absolute bottom-[15%] transition-all duration-500 ${
        phase === 'deal' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}>
        <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm font-bold">
          <div className="flex -space-x-1.5">
            {Array.from({ length: playerCount }).map((_, i) => (
              <div
                key={i}
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 border-2 border-slate-700 flex items-center justify-center text-[8px] sm:text-[10px] font-black text-white"
              >
                {i + 1}
              </div>
            ))}
          </div>
          <span className="tracking-wider uppercase">7 cards each</span>
        </div>
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes shuffleRiffle {
          0% { transform: translateX(var(--x, 0)) translateY(var(--y, 0)) rotate(var(--r, 0deg)); }
          50% { transform: translateX(0) translateY(-8px) rotate(0deg); }
          100% { transform: translateX(calc(var(--x, 0) * -1)) translateY(var(--y, 0)) rotate(calc(var(--r, 0deg) * -1)); }
        }
      `}</style>
    </div>
  );
};

export default ShuffleAnimation;
