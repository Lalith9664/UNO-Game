import React from 'react';
import { Palette } from 'lucide-react';

export const ColorPickerModal = ({
  isOpen = false,
  onSelectColor,
  playerName,
  isWildDrawFour = false
}) => {
  if (!isOpen) return null;

  const colors = [
    { id: 'red', name: 'Red', bg: 'bg-red-500 hover:bg-red-600 shadow-red-500/25 ring-red-500/20' },
    { id: 'blue', name: 'Blue', bg: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/25 ring-blue-500/20' },
    { id: 'green', name: 'Green', bg: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25 ring-emerald-500/20' },
    { id: 'yellow', name: 'Yellow', bg: 'bg-amber-400 hover:bg-yellow-500 shadow-yellow-400/25 ring-yellow-400/20 text-slate-900' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"></div>

      {/* Modal Card */}
      <div className="relative glass-panel rounded-3xl w-full max-w-sm overflow-hidden border border-white/10 shadow-2xl p-6 text-center animate-deal-card">
        
        {/* Decorative palette icon */}
        <div className="mx-auto w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-3">
          <Palette className="h-6 w-6 text-amber-400" />
        </div>

        <h3 className="text-xl font-extrabold text-white tracking-wide">
          CHOOSE A COLOR
        </h3>
        
        <p className="text-xs text-slate-400 mt-1 mb-6">
          {playerName} played a <span className="font-bold text-white">{isWildDrawFour ? 'Wild Draw Four' : 'Wild'}</span> card!
        </p>

        {/* Color Button Grid */}
        <div className="grid grid-cols-2 gap-4">
          {colors.map((color) => (
            <button
              key={color.id}
              onClick={() => onSelectColor(color.id)}
              className={`
                ${color.bg}
                h-20 rounded-2xl font-black text-lg tracking-wide uppercase transition-all duration-300
                shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center border border-white/10
                ring-4 ring-offset-2 ring-offset-slate-900 ring-transparent hover:ring-white/10
              `}
            >
              {color.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPickerModal;
