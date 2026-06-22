import React from 'react';
import { RotateCw, RotateCcw, Clock, ShieldAlert } from 'lucide-react';

export const TurnIndicator = ({
  activePlayerName,
  direction,
  currentColor,
  timerValue,
  maxTimerValue,
  totalPlayers,
  isLandscapeMobile = false
}) => {
  // Calculate percentage of timer remaining
  const timerPercentage = maxTimerValue ? (timerValue / maxTimerValue) * 100 : 0;
  
  // Decide color of timer based on time remaining
  const timerColor = 
    timerPercentage > 50 ? 'bg-emerald-500' :
    timerPercentage > 25 ? 'bg-amber-500' :
    'bg-red-500 animate-pulse';

  // Map active color names to tailwind border/bg colors
  const colorBorders = {
    red: 'border-red-500 text-red-500 bg-red-500/10',
    blue: 'border-blue-500 text-blue-500 bg-blue-500/10',
    green: 'border-emerald-500 text-emerald-500 bg-emerald-500/10',
    yellow: 'border-amber-400 text-amber-400 bg-amber-400/10',
    wild: 'border-slate-400 text-slate-400 bg-slate-400/10'
  };

  const activeColorStyle = colorBorders[currentColor] || colorBorders.wild;

  if (isLandscapeMobile) {
    return (
      <div className="glass-panel rounded-full px-3 py-1 flex items-center gap-3 border border-white/10 shadow-md relative overflow-hidden select-none">
        {/* Decorative top edge reflecting the current color */}
        <div className={`absolute top-0 left-0 right-0 h-0.5 transition-colors duration-500
          ${currentColor === 'red' ? 'bg-red-500' : ''}
          ${currentColor === 'blue' ? 'bg-blue-500' : ''}
          ${currentColor === 'green' ? 'bg-emerald-500' : ''}
          ${currentColor === 'yellow' ? 'bg-amber-400' : ''}
        `}></div>

        {/* Active Player Info */}
        <div className="flex items-center gap-1 text-[10px]">
          <span className="font-bold text-slate-400">Turn:</span>
          <span className="font-black text-white truncate max-w-[80px]">{activePlayerName}</span>
        </div>

        {/* Color Info */}
        <div className="flex items-center gap-1 text-[10px]">
          <span className="font-bold text-slate-400">Color:</span>
          <span className={`px-1.5 py-0.25 rounded text-[9px] font-black uppercase border transition-all duration-300 ${activeColorStyle}`}>
            {currentColor}
          </span>
        </div>

        {/* Timer Display */}
        {maxTimerValue && (
          <div className="flex items-center gap-1 text-[10px] text-slate-300 font-bold">
            <Clock className="h-3 w-3 text-slate-400" />
            <span>{timerValue}s</span>
          </div>
        )}

        {/* Direction Indicator */}
        <div className="flex items-center gap-1 bg-white/5 px-1.5 py-0.25 rounded-full text-[9px] font-semibold text-slate-350">
          {direction === 'clockwise' ? (
            <RotateCw className="h-2.5 w-2.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
          ) : (
            <RotateCcw className="h-2.5 w-2.5 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-2.5 sm:p-4 w-full max-w-[280px] sm:max-w-md flex flex-col gap-2 sm:gap-3.5 border border-white/10 shadow-lg relative overflow-hidden">
      {/* Decorative top edge reflecting the current color */}
      <div className={`absolute top-0 left-0 right-0 h-1 transition-colors duration-500
        ${currentColor === 'red' ? 'bg-red-500' : ''}
        ${currentColor === 'blue' ? 'bg-blue-500' : ''}
        ${currentColor === 'green' ? 'bg-emerald-500' : ''}
        ${currentColor === 'yellow' ? 'bg-amber-400' : ''}
      `}></div>

      <div className="flex items-center justify-between gap-2">
        {/* Active Player Info */}
        <div className="flex flex-col">
          <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Player</span>
          <span className="text-sm sm:text-lg font-extrabold text-white tracking-wide truncate max-w-[100px] sm:max-w-none">{activePlayerName}</span>
        </div>

        {/* Direction Indicator */}
        <div className="flex flex-col items-end">
          <span className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1">Direction</span>
          <div className="flex items-center gap-1 bg-white/5 border border-white/5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-semibold text-slate-300">
            {direction === 'clockwise' ? (
              <>
                <RotateCw className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span className="hidden xs:inline">Clockwise</span>
                <span className="xs:hidden">CW</span>
              </>
            ) : (
              <>
                <RotateCcw className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span className="hidden xs:inline">Counter-CW</span>
                <span className="xs:hidden">CCW</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 mt-0.5">
        {/* Active Color Info */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] sm:text-xs text-slate-400 font-semibold">Play Color:</span>
          <span className={`px-2 py-0.5 rounded-full text-[9px] sm:text-xs font-black uppercase border transition-all duration-300 ${activeColorStyle}`}>
            {currentColor}
          </span>
        </div>

        {/* Timer Display */}
        {maxTimerValue && (
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-300 font-bold">
            <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400" />
            <span>{timerValue}s left</span>
          </div>
        )}
      </div>

      {/* Timer Progress Bar */}
      {maxTimerValue && (
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ${timerColor}`}
            style={{ width: `${timerPercentage}%` }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default TurnIndicator;
