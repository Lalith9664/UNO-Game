import React from 'react';
import Card from './Card';

export const RuleCard = ({
  title,
  description,
  cardColor,
  cardValue,
  points
}) => {
  return (
    <div className="glass-card rounded-2xl p-4 border border-white/5 bg-slate-900/40 hover:bg-slate-900/50 hover:border-white/10 transition-all duration-300 flex flex-col sm:flex-row gap-4 items-center sm:items-start shadow-lg">
      {/* Visual representation of the card */}
      <div className="flex-shrink-0">
        <Card
          card={{ color: cardColor, value: cardValue, type: cardColor === 'wild' ? 'wild' : 'number' }}
          hoverable={true}
          disabled={false}
          size="md"
        />
      </div>

      {/* Description text */}
      <div className="flex flex-col gap-1.5 text-center sm:text-left flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h4 className="font-extrabold text-base text-white tracking-wide uppercase">
            {title}
          </h4>
          <span className="text-[10px] font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 self-center sm:self-auto">
            {points}
          </span>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed font-normal">
          {description}
        </p>
      </div>
    </div>
  );
};

export default RuleCard;
