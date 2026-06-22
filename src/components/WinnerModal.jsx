import React from 'react';
import { Trophy, RotateCcw, Home, Clock, Hash, CheckSquare } from 'lucide-react';

export const WinnerModal = ({
  winner,
  matchStats,
  onPlayAgain,
  onBackToHome
}) => {
  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>

      {/* Modal Container */}
      <div className="relative glass-panel rounded-3xl w-full max-w-lg overflow-hidden border border-white/10 shadow-2xl shadow-black/80 animate-deal-card max-h-[90vh] flex flex-col">
        
        {/* Glow effect matching winner avatar color */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[100px] opacity-40 bg-gradient-to-r ${winner.avatarGradient}`}></div>

        {/* Modal Header */}
        <div className="relative pt-8 pb-4 flex flex-col items-center text-center px-6">
          <div className={`h-20 w-20 rounded-2xl bg-gradient-to-r ${winner.avatarGradient} flex items-center justify-center shadow-lg shadow-black/40 mb-4 border border-white/20`}>
            <Trophy className="h-10 w-10 text-white animate-bounce-slow" />
          </div>
          
          <h2 className="text-3xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 drop-shadow-sm uppercase">
            VICTORY!
          </h2>
          <p className="text-slate-300 font-medium text-sm mt-1">
            We have a winner!
          </p>
        </div>

        {/* Winner Details Card */}
        <div className="relative px-8 py-4 flex flex-col items-center">
          <div className={`px-6 py-2.5 rounded-full border border-white/10 bg-white/5 font-extrabold text-xl text-white shadow-inner flex items-center gap-2 mb-6`}>
            <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${winner.avatarGradient}`}></span>
            {winner.name}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="glass-card rounded-2xl p-4 flex flex-col gap-1 border border-white/5 bg-slate-900/35">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="h-3 w-3 text-cyan-400" />
                Duration
              </span>
              <span className="text-xl font-extrabold text-white">
                {matchStats.duration}s
              </span>
            </div>

            <div className="glass-card rounded-2xl p-4 flex flex-col gap-1 border border-white/5 bg-slate-900/35">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Hash className="h-3 w-3 text-purple-400" />
                Total Turns
              </span>
              <span className="text-xl font-extrabold text-white">
                {matchStats.totalTurns}
              </span>
            </div>

            <div className="glass-card rounded-2xl p-4 flex flex-col gap-1 border border-white/5 bg-slate-900/35">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <CheckSquare className="h-3 w-3 text-emerald-400" />
                Cards Played
              </span>
              <span className="text-xl font-extrabold text-white">
                {winner.stats?.cardsPlayed || 0}
              </span>
            </div>

            <div className="glass-card rounded-2xl p-4 flex flex-col gap-1 border border-white/5 bg-slate-900/35">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Trophy className="h-3 w-3 text-yellow-400" />
                Turns Taken
              </span>
              <span className="text-xl font-extrabold text-white">
                {winner.stats?.turnsTaken || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="relative mt-auto p-6 bg-slate-900/50 border-t border-white/5 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-extrabold px-6 py-3.5 rounded-xl shadow-lg shadow-red-500/20 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Play Again
          </button>
          <button
            onClick={onBackToHome}
            className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold px-6 py-3.5 rounded-xl active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinnerModal;
