import React from 'react';
import Card from './Card';
import { isValidMove } from '../utils/gameRules';

export const PlayerHand = ({
  hand = [],
  onPlayCard,
  isCurrentTurn = false,
  topCard,
  currentColor,
  playerName,
  onRename,
  cardSize = 'md',
  isLandscapeMobile = false
}) => {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Player Header Info - hidden on landscape mobile to save space */}
      {!isLandscapeMobile && (
        <div className="w-full max-w-4xl flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 px-2 sm:px-4 mb-0.5 sm:mb-2">
          <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5 sm:gap-2">
            {onRename ? (
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5 py-0.25 max-w-[110px] sm:max-w-[140px] focus-within:border-amber-500/50 transition-colors">
                <input
                  type="text"
                  value={playerName}
                  maxLength={16}
                  onChange={(e) => onRename(e.target.value)}
                  className="bg-transparent border-none text-[10px] sm:text-xs text-white font-extrabold outline-none w-full placeholder:text-slate-655"
                  placeholder="Rename..."
                  title="Click to rename"
                />
              </div>
            ) : (
              <span>{playerName}</span>
            )}
            <span className="text-slate-500 font-medium">'s Hand</span>
            <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-slate-600"></span>
            <span className="text-slate-500 font-bold">{hand.length} {hand.length === 1 ? 'Card' : 'Cards'}</span>
          </h3>
          
          {isCurrentTurn && (
            <span className="text-[9px] sm:text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.25 sm:px-2 sm:py-0.5 rounded border border-emerald-500/20 animate-pulse-slow">
              YOUR TURN - SELECT A CARD
            </span>
          )}
        </div>
      )}

      {/* Cards List */}
      <div className={`w-fit mx-auto glass-panel-light border border-white/5 shadow-inner
        ${isLandscapeMobile ? 'max-w-[92vw] rounded-lg p-1' : 'max-w-[95vw] rounded-xl sm:rounded-2xl p-1.5 sm:p-2.5'}
      `}>
        {hand.length === 0 ? (
          <div className={`flex items-center justify-center text-slate-500 font-medium
            ${isLandscapeMobile ? 'py-2 text-[8px]' : 'py-4 sm:py-8 text-xs sm:text-sm'}
          `}>
            No cards left.
          </div>
        ) : (
          <div className={`flex items-center justify-start md:justify-center overflow-x-auto no-scrollbar max-w-full custom-scrollbar scroll-smooth
            ${isLandscapeMobile ? 'pt-2 pb-0.5 px-2' : 'pt-4 pb-1.5 px-3'}
          `}>
            {hand.map((card, index) => {
              // Calculate playability
              const playable = isCurrentTurn && isValidMove(card, topCard, currentColor, hand);

              // Overlap class based on size to stack cards horizontally
              const overlapClass = cardSize === 'xs'
                ? 'first:ml-0 -ml-5'
                : cardSize === 'sm'
                  ? 'first:ml-0 -ml-6 sm:-ml-8'
                  : 'first:ml-0 -ml-8 sm:-ml-10 md:-ml-12';

              return (
                <div
                  key={card.id}
                  className={`relative z-10 transform transition-all duration-300 flex-shrink-0 ${overlapClass}
                    ${playable ? 'hover:z-50 hover:scale-105' : ''}
                    ${playable ? (isLandscapeMobile ? 'hover:-translate-y-2' : 'hover:-translate-y-4') : ''}
                  `}
                >
                  <Card
                    card={card}
                    onClick={() => playable && onPlayCard(card.id)}
                    isPlayable={playable}
                    hoverable={false}
                    disabled={!playable}
                    size={cardSize}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerHand;
