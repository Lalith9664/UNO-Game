import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Game from './pages/Game';
import Rules from './pages/Rules';
import Settings from './pages/Settings';

/**
 * Route switch definitions for pages
 */
export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game" element={<Game />} />
      <Route path="/rules" element={<Rules />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
};

export default AppRouter;
