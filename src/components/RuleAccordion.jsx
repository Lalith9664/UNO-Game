import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const RuleAccordion = ({
  title,
  content,
  isOpen,
  onToggle,
  searchTerm = ""
}) => {
  // Helper to highlight matching search term
  const highlightText = (text, highlight) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) => 
      regex.test(part) 
        ? <mark key={index} className="bg-yellow-400/30 text-yellow-200 rounded px-0.5 border-b border-yellow-500/40">{part}</mark> 
        : part
    );
  };

  return (
    <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 shadow-md shrink-0">
      {/* Header Button */}
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between font-bold text-slate-200 hover:text-white hover:bg-white/5 transition-all text-left"
      >
        <span className="text-sm md:text-base tracking-wide">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-red-400 shrink-0 ml-4" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400 shrink-0 ml-4" />
        )}
      </button>

      {/* Collapsible Content */}
      <div
        className={`
          transition-all duration-300 ease-in-out overflow-hidden
          ${isOpen ? 'max-h-96 opacity-100 border-t border-white/5' : 'max-h-0 opacity-0 pointer-events-none'}
        `}
      >
        <p className="px-6 py-4 text-sm leading-relaxed text-slate-300 font-normal">
          {highlightText(content, searchTerm)}
        </p>
      </div>
    </div>
  );
};

export default RuleAccordion;
