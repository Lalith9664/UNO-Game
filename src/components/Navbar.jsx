import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Play, BookOpen, Settings as SettingsIcon, Sparkles } from 'lucide-react';
import { useUnoGame } from '../hooks/useUnoGame';

export const Navbar = () => {
  const location = useLocation();
  const { gameStage, playSound } = useUnoGame();

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) => `
    flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium
    ${isActive(path) 
      ? 'bg-gradient-to-r from-red-500 to-amber-500 text-white shadow-md shadow-red-500/20' 
      : 'text-slate-300 hover:text-white hover:bg-white/5'}
  `;

  return (
    <nav className="glass-panel sticky top-0 z-40 px-4 md:px-8 py-3.5 landscape:py-1.5 flex items-center justify-between border-b border-white/5">
      <Link 
        to="/" 
        onClick={() => playSound('click')}
        className="flex items-center gap-2 font-black text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 drop-shadow"
      >
        <Sparkles className="h-6 w-6 text-red-500 animate-pulse-slow fill-red-500" />
        <span>UNO</span>
      </Link>

      <div className="flex items-center gap-1.5 md:gap-3">
        <Link 
          to="/" 
          onClick={() => playSound('click')}
          className={linkClass('/')}
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Home</span>
        </Link>

        <Link 
          to="/game" 
          onClick={() => playSound('click')}
          className={linkClass('/game')}
        >
          <Play className="h-4 w-4" />
          <span className="hidden sm:inline">
            {gameStage === 'playing' ? 'Active Game' : 'Play'}
          </span>
        </Link>

        <Link 
          to="/rules" 
          onClick={() => playSound('click')}
          className={linkClass('/rules')}
        >
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">Rules</span>
        </Link>

        <Link 
          to="/settings" 
          onClick={() => playSound('click')}
          className={linkClass('/settings')}
        >
          <SettingsIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
