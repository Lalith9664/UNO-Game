import React from 'react';
import { Sparkles } from 'lucide-react';

// Custom action SVGs for authentic representation
const SkipIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="8.5" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ReverseIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3l4 4-4 4" />
    <path d="M21 7H9a6 6 0 00-6 6v1" />
    <path d="M7 21l-4-4 4-4" />
    <path d="M3 17h12a6 6 0 006-6v-1" />
  </svg>
);

const WildWheel = ({ className }) => (
  <div className={`relative rounded-full overflow-hidden border border-white/20 shadow-inner ${className}`}>
    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
      <div className="bg-red-600"></div>
      <div className="bg-blue-600"></div>
      <div className="bg-yellow-400"></div>
      <div className="bg-green-600"></div>
    </div>
    <div className="absolute inset-1.5 bg-slate-900/40 rounded-full flex items-center justify-center">
      <Sparkles className="h-1/2 w-1/2 text-white/80" />
    </div>
  </div>
);

export const Card = ({
  card,
  onClick,
  isPlayable = false,
  faceDown = false,
  size = 'md',
  hoverable = true,
  disabled = false
}) => {
  if (!card) return null;

  const { color, value, type } = card;

  // Size styles
  const sizeClasses = {
    xs: 'w-[40px] h-[60px] text-[7px] rounded-md',
    sm: 'w-[48px] h-[72px] text-[9px] sm:w-16 sm:h-24 sm:text-xs rounded-md sm:rounded-lg',
    md: 'w-16 h-24 text-[10px] sm:w-20 sm:h-[120px] md:w-24 md:h-36 sm:text-xs md:text-sm rounded-lg sm:rounded-xl',
    lg: 'w-20 h-[120px] text-xs sm:w-[104px] sm:h-[156px] md:w-32 md:h-48 sm:text-sm md:text-base rounded-xl sm:rounded-2xl',
    xl: 'w-28 h-[168px] text-sm sm:w-[136px] sm:h-[204px] md:w-40 md:h-60 sm:text-base md:text-lg rounded-2xl sm:rounded-3xl'
  };

  // Color gradient mappings
  const colorGradients = {
    red: 'from-red-500 via-red-600 to-red-700 shadow-red-500/10 text-white',
    blue: 'from-blue-500 via-blue-600 to-blue-700 shadow-blue-500/10 text-white',
    green: 'from-emerald-500 via-emerald-600 to-emerald-700 shadow-emerald-500/10 text-white',
    yellow: 'from-amber-400 via-yellow-400 to-yellow-500 shadow-yellow-400/10 text-slate-900 border-amber-300',
    wild: 'from-slate-800 via-slate-900 to-black border-slate-700 text-white',
  };

  const activeGradient = colorGradients[color] || colorGradients.wild;

  // Render Card Back
  if (faceDown) {
    return (
      <div
        className={`
          ${sizeClasses[size]}
          relative flex-shrink-0 bg-gradient-to-br from-red-700 via-red-800 to-red-950
          border-2 md:border-4 border-amber-400 card-shadow flex items-center justify-center overflow-hidden select-none
          ${hoverable && !disabled ? 'hover:-translate-y-2 hover:shadow-xl transition-all duration-300 cursor-pointer' : 'transition-all duration-300'}
        `}
        onClick={!disabled ? onClick : undefined}
      >
        {/* Pattern Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.25)_0%,transparent_70%)]"></div>
        
        {/* Oval center shape */}
        <div className="absolute w-[120%] h-[75%] bg-black rounded-[100%] rotate-[28deg] border-2 border-amber-400/40 opacity-70"></div>
        
        {/* Diagonal "UNO" Logo */}
        <span className={`relative z-10 font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 tracking-wider text-center rotate-[-28deg] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-sans italic ${
          size === 'xs' ? 'text-[8px]' : size === 'sm' ? 'text-xs sm:text-lg' : size === 'md' ? 'text-base sm:text-xl md:text-2xl' : size === 'lg' ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-3xl sm:text-4xl md:text-5xl'
        }`}>
          UNO
        </span>
      </div>
    );
  }

  // Render Inner Value/Symbol
  const renderSymbol = (isCorner = false) => {
    const iconSize = isCorner
      ? 'h-2.5 w-2.5 sm:h-3 w-3'
      : size === 'xs'
        ? 'h-3.5 w-3.5'
        : size === 'sm' 
          ? 'h-4 w-4 sm:h-6 sm:w-6' 
          : size === 'md' 
            ? 'h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10' 
            : size === 'lg' 
              ? 'h-8 w-8 sm:h-10 sm:w-10 md:h-14 md:w-14' 
              : 'h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16';

    if (value === 'skip') {
      return <SkipIcon className={iconSize} />;
    }
    if (value === 'reverse') {
      return <ReverseIcon className={iconSize} />;
    }
    if (value === 'draw2') {
      return <span className="font-black font-sans leading-none">{isCorner ? '+2' : '+2'}</span>;
    }
    if (value === 'wild') {
      return isCorner ? (
        <span className="font-extrabold text-[8px] sm:text-[10px] text-white">W</span>
      ) : (
        <WildWheel className={iconSize} />
      );
    }
    if (value === 'wild4') {
      return isCorner ? (
        <span className="font-extrabold text-[8px] sm:text-[10px] text-white">+4</span>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <WildWheel className={`${iconSize} mb-0.5 sm:mb-1`} />
          <span className={`font-black tracking-tighter leading-none ${size === 'lg' ? 'text-base sm:text-xl' : 'text-[10px] sm:text-xs md:text-sm'} text-white drop-shadow`}>+4</span>
        </div>
      );
    }

    // Number cards
    return (
      <span className={`font-black font-sans leading-none italic ${isCorner ? '' : size === 'xs' ? 'text-sm' : size === 'sm' ? 'text-base sm:text-xl' : size === 'md' ? 'text-2xl sm:text-3xl md:text-4xl' : size === 'lg' ? 'text-4xl sm:text-5xl md:text-6xl' : 'text-5xl sm:text-6xl md:text-7xl'}`}>
        {value}
      </span>
    );
  };

  return (
    <button
      disabled={disabled || (onClick === undefined)}
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        relative flex-shrink-0 bg-gradient-to-br ${activeGradient}
        border-2 border-white/20 select-none overflow-hidden transition-all duration-300 text-left
        ${isPlayable ? 'card-playable-shadow cursor-pointer border-white animate-float ring-2 ring-white/40 ring-offset-2 ring-offset-slate-900 z-20' : 'card-shadow z-10'}
        ${!isPlayable && !disabled && onClick ? 'opacity-90 hover:opacity-100 cursor-pointer' : ''}
        ${hoverable && isPlayable ? 'hover:-translate-y-4 hover:scale-105' : ''}
        ${disabled ? 'opacity-100 saturate-[30%] brightness-[65%] cursor-not-allowed pointer-events-none' : ''}
      `}
    >
      {/* Corner index - Top Left */}
      <div className="absolute top-1.5 left-1.5 flex flex-col items-center leading-none">
        {renderSymbol(true)}
      </div>

      {/* Center Oval Shape */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[68%] bg-white rounded-[100%] rotate-[-25deg] shadow-inner flex items-center justify-center">
        {/* Colored Inner oval shadow */}
        <div className="absolute w-[95%] h-[95%] bg-slate-950/5 rounded-[100%]"></div>
      </div>

      {/* Main Symbol - Center (rotated opposite to offset oval tilt) */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center ${
        color === 'yellow' ? 'text-amber-950' : 'text-white'
      }`}>
        <div className="rotate-[5deg] drop-shadow-[0_2px_3px_rgba(0,0,0,0.2)]">
          {renderSymbol(false)}
        </div>
      </div>

      {/* Corner index - Bottom Right */}
      <div className="absolute bottom-1.5 right-1.5 flex flex-col items-center leading-none rotate-180">
        {renderSymbol(true)}
      </div>
    </button>
  );
};

export default Card;
