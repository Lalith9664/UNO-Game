import React from 'react';
import Card from './Card';
import { Layers } from 'lucide-react';

export const DrawPile = ({ cardCount, canDraw, onDraw, size = 'md', pendingDrawCount = 0 }) => {
  return (
    <div className="relative group select-none">
      {/* 3D stacked deck effect */}
      {cardCount > 3 && (
        <div className="absolute inset-0 bg-red-900 border-2 border-amber-500/20 rounded-xl translate-x-1.5 translate-y-1.5 shadow-md"></div>
      )}
      {cardCount > 1 && (
        <div className="absolute inset-0 bg-red-850 border-2 border-amber-500/45 rounded-xl translate-x-0.75 translate-y-0.75 shadow"></div>
      )}

      {/* Pulsing red ring/overlay for pending draw stacking penalty */}
      {pendingDrawCount > 0 && (
        <div className="absolute inset-0 bg-rose-600/15 animate-pulse rounded-xl pointer-events-none border border-rose-500/30 z-30"></div>
      )}

      {/* Top card of the draw pile */}
      <div className="relative">
        <Card
          card={{ color: 'wild', value: 'uno', type: 'wild' }}
          faceDown={true}
          onClick={canDraw ? onDraw : undefined}
          hoverable={canDraw}
          isPlayable={canDraw}
          disabled={!canDraw}
          size={size}
        />
        
        {/* Draw action helper overlay */}
        {pendingDrawCount > 0 ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-35">
            <span className="bg-gradient-to-r from-rose-500 to-red-650 border border-rose-400 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-lg shadow-rose-950/50 animate-bounce-slow tracking-wider uppercase">
              Draw +{pendingDrawCount}
            </span>
          </div>
        ) : (
          canDraw && (
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-xl pointer-events-none transition-opacity duration-300 flex items-center justify-center">
              <span className="bg-slate-950/80 backdrop-blur-md px-2 py-1.5 rounded-lg text-xs font-bold tracking-wider border border-white/10 text-white shadow-xl animate-bounce-slow">
                DRAW CARD
              </span>
            </div>
          )
        )}
      </div>

      {/* Deck remaining card count badge */}
      <div className="absolute -bottom-3 -right-3 bg-slate-900/90 backdrop-blur border border-white/10 text-amber-400 font-extrabold text-[11px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-black/40">
        <Layers className="h-3 w-3" />
        <span>{cardCount}</span>
      </div>
    </div>
  );
};

export default DrawPile;
