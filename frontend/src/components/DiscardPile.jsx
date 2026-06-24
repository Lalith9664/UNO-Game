import React, { useMemo } from 'react';
import Card from './Card';

export const DiscardPile = ({ discardPile = [], currentColor, size = 'md' }) => {
  const topCard = discardPile[discardPile.length - 1];
  const prevCard = discardPile.length > 1 ? discardPile[discardPile.length - 2] : null;
  const prevCard2 = discardPile.length > 2 ? discardPile[discardPile.length - 3] : null;

  // Map of active color glow styles
  const colorGlows = {
    red: 'rgba(239, 68, 68, 0.35)',
    blue: 'rgba(59, 130, 246, 0.35)',
    green: 'rgba(16, 185, 129, 0.35)',
    yellow: 'rgba(245, 158, 11, 0.35)',
    wild: 'rgba(148, 163, 184, 0.2)'
  };

  const activeGlow = colorGlows[currentColor] || colorGlows.wild;

  // Generate rotation values once so they don't jump on every render
  const rotations = useMemo(() => {
    return {
      prev1: Math.floor(Math.random() * 24) - 12, // -12 to 12 degrees
      prev2: Math.floor(Math.random() * 30) - 15  // -15 to 15 degrees
    };
  }, [prevCard?.id, prevCard2?.id]);

  if (!topCard) {
    const sizeClasses = {
      xs: 'w-[40px] h-[60px] text-[7px] rounded-md',
      sm: 'w-[48px] h-[72px] text-[9px] rounded-md',
      md: 'w-16 h-24 sm:w-20 sm:h-[120px] md:w-24 md:h-36 text-[10px] sm:text-xs rounded-lg sm:rounded-xl',
    };
    return (
      <div className={`${sizeClasses[size] || sizeClasses.md} border-2 border-dashed border-white/20 flex items-center justify-center text-slate-500`}>
        Empty
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Active Color Ambient Glow */}
      <div
        className="absolute -inset-10 rounded-full blur-2xl transition-colors duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${activeGlow} 0%, transparent 70%)`
        }}
      ></div>

      {/* Second Previous Card (Bottom) */}
      {prevCard2 && (
        <div 
          className="absolute transition-transform duration-300"
          style={{ transform: `rotate(${rotations.prev2}deg) scale(0.95)` }}
        >
          <Card card={prevCard2} hoverable={false} disabled={true} size={size} />
        </div>
      )}

      {/* First Previous Card (Middle) */}
      {prevCard && (
        <div 
          className="absolute transition-transform duration-300 shadow-md"
          style={{ transform: `rotate(${rotations.prev1}deg) scale(0.98)` }}
        >
          <Card card={prevCard} hoverable={false} disabled={true} size={size} />
        </div>
      )}

      {/* Current Top Card (Top) */}
      <div className="relative z-10 transition-transform duration-300 hover:scale-102">
        <Card card={topCard} hoverable={false} size={size} />
      </div>

      {/* Small badge displaying the current active color (mostly useful if top card is a Wild card) */}
      <div className={`absolute -top-3 -right-3 z-20 px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest border border-white/10 uppercase shadow-lg shadow-black/50 transition-all duration-300 ${
        currentColor === 'red' ? 'bg-red-600 text-white' : ''
      } ${
        currentColor === 'blue' ? 'bg-blue-600 text-white' : ''
      } ${
        currentColor === 'green' ? 'bg-emerald-600 text-white' : ''
      } ${
        currentColor === 'yellow' ? 'bg-amber-400 text-slate-900 border-amber-300' : ''
      }`}>
        {currentColor}
      </div>
    </div>
  );
};

export default DiscardPile;
