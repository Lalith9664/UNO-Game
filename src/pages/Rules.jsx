import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen, HelpCircle, Eye, ArrowLeft, Play, X } from 'lucide-react';
import { useUnoGame } from '../hooks/useUnoGame';
import { rulesSections, faqData } from '../data/rulesData';
import RuleAccordion from '../components/RuleAccordion';
import RuleCard from '../components/RuleCard';

export const Rules = () => {
  const navigate = useNavigate();
  const { gameStage, playSound } = useUnoGame();
  const [searchTerm, setSearchTerm] = useState('');
  const [openAccordions, setOpenAccordions] = useState({});

  // Toggle single accordion state
  const handleToggleAccordion = (id) => {
    playSound('click');
    setOpenAccordions(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Clear search query
  const clearSearch = () => {
    playSound('click');
    setSearchTerm('');
  };

  // Filter sections by search term matching title, content, or tags
  const filteredSections = useMemo(() => {
    if (!searchTerm.trim()) return rulesSections;
    const term = searchTerm.toLowerCase().trim();
    return rulesSections.filter(section => 
      section.title.toLowerCase().includes(term) ||
      section.content.toLowerCase().includes(term) ||
      section.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }, [searchTerm]);

  const handleBack = () => {
    playSound('click');
    navigate(-1);
  };

  const handleBackToGame = () => {
    playSound('click');
    navigate('/game');
  };

  return (
    <div className="min-h-[calc(100vh-68px)] py-10 px-4 max-w-7xl mx-auto flex flex-col gap-8">
      
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-350 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            title="Go Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-wide uppercase flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-red-500" />
              <span>UNO Rulebook</span>
            </h2>
            <p className="text-xs text-slate-400">
              Read the official guidelines and view card effects
            </p>
          </div>
        </div>

        {/* Back to Game Shortcut */}
        {gameStage === 'playing' && (
          <button
            onClick={handleBackToGame}
            className="bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-650 hover:to-amber-650 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-lg shadow-red-500/10 active:scale-98 transition-all flex items-center gap-2 self-start sm:self-auto uppercase tracking-wider"
          >
            <Play className="h-4 w-4 fill-white" />
            Resume Game
          </button>
        )}
      </div>

      {/* Main Grid: Left (Accordions & Search) | Right (Visualizations & FAQ) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Rule Accordions */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h3 className="font-extrabold text-lg text-white tracking-wide uppercase flex items-center gap-2">
              <span>Rule Explanations</span>
              <span className="text-[10px] text-slate-400 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5">
                {filteredSections.length} Sections
              </span>
            </h3>
            
            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-450" />
              <input
                type="text"
                placeholder="Search rules (e.g. Draw, Reverse, Penalty...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-10 py-3.5 glass-input rounded-2xl text-sm placeholder-slate-500"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 max-h-[75vh] overflow-y-auto pr-1.5 custom-scrollbar">
            {filteredSections.length === 0 ? (
              <div className="py-12 glass-panel rounded-2xl flex flex-col items-center justify-center text-center p-6 border border-white/5 text-slate-550">
                <HelpCircle className="h-10 w-10 mb-2" />
                <p className="font-bold text-sm">No rules match your search.</p>
                <button onClick={clearSearch} className="text-red-400 hover:underline text-xs mt-1.5 font-semibold">
                  Clear Search Filter
                </button>
              </div>
            ) : (
              filteredSections.map(section => (
                <RuleAccordion
                  key={section.id}
                  title={section.title}
                  content={section.content}
                  isOpen={!!openAccordions[section.id] || searchTerm.length > 0} // Auto-expand matching sections
                  onToggle={() => handleToggleAccordion(section.id)}
                  searchTerm={searchTerm}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column: Rule Visualizations & FAQ */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          {/* Rule Visualization Section */}
          <div className="flex flex-col gap-4">
            <h3 className="font-extrabold text-lg text-white tracking-wide uppercase flex items-center gap-2">
              <Eye className="h-5 w-5 text-amber-400" />
              <span>Card Visualizations</span>
            </h3>
            
            <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto pr-1.5 custom-scrollbar">
              <RuleCard
                title="Number Cards"
                description="Number cards (0-9) have no special action. They come in 4 colors (Red, Blue, Green, Yellow). Matches can be played on identical colors or identical numbers."
                cardColor="red"
                cardValue="5"
                points="Face Value"
              />
              <RuleCard
                title="Skip Cards"
                description="Forces the next player to lose their turn. Playable on matching colors or on other Skip cards."
                cardColor="green"
                cardValue="skip"
                points="20 Points"
              />
              <RuleCard
                title="Reverse Cards"
                description="Reverses the direction of turn rotation. If playing 2-players, acts like a Skip card (skips opponent, player goes again)."
                cardColor="blue"
                cardValue="reverse"
                points="20 Points"
              />
              <RuleCard
                title="Draw Two (+2)"
                description="Forces the next player to draw 2 cards from the deck and forfeit their turn."
                cardColor="yellow"
                cardValue="draw2"
                points="20 Points"
              />
              <RuleCard
                title="Wild Cards"
                description="Allows the player to declare the next active color. Playable on any turn, regardless of other matching hand cards."
                cardColor="wild"
                cardValue="wild"
                points="50 Points"
              />
              <RuleCard
                title="Wild Draw Four (+4)"
                description="Allows declaring the play color and forces the next player to draw 4 cards and skip. Restricted: only playable if player has NO cards matching current active color."
                cardColor="wild"
                cardValue="wild4"
                points="50 Points"
              />
            </div>
          </div>

          {/* FAQ Section */}
          <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
            <h3 className="font-extrabold text-lg text-white tracking-wide uppercase flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-purple-400" />
              <span>Frequently Asked Questions</span>
            </h3>
            
            <div className="flex flex-col gap-4">
              {faqData.map((faq, index) => (
                <div key={index} className="glass-panel p-4.5 rounded-2xl border border-white/5 bg-slate-900/20">
                  <h4 className="font-bold text-sm text-amber-400 mb-1">
                    Q: {faq.question}
                  </h4>
                  <p className="text-xs text-slate-350 leading-relaxed font-normal">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Rules;
