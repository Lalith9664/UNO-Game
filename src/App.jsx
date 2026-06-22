import React from 'react';
import { useLocation } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { useUnoGame } from './hooks/useUnoGame';
import Navbar from './components/Navbar';
import AppRouter from './router';

/**
 * Inner layout component that has access to GameContext.
 * Controls navbar visibility based on route and game stage.
 */
function AppLayout() {
  const location = useLocation();
  const { gameStage } = useUnoGame();
  const isGamePage = location.pathname === '/game';

  // Show navbar everywhere except during active gameplay (playing/ended)
  const showNavbar = !isGamePage || gameStage === 'setup';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col transition-colors duration-500 selection:bg-red-500 selection:text-white">
      {/* Persistent top navigation bar - hidden during active gameplay */}
      {showNavbar && <Navbar />}
      
      {/* Dynamic page container */}
      <main className="flex-1 flex flex-col">
        <AppRouter />
      </main>
    </div>
  );
}

/**
 * Root Application component providing global theme, context, and basic layouts.
 */
function App() {
  return (
    <GameProvider>
      <AppLayout />
    </GameProvider>
  );
}

export default App;
