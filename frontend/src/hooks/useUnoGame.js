import { useContext } from 'react';
import { GameContext } from '../context/GameContext';

/**
 * Custom React hook to consume the UNO game state and actions
 * @returns {Object} Game Context State and Actions
 */
export const useUnoGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useUnoGame must be used within a GameProvider');
  }
  return context;
};
export default useUnoGame;
