import { CARD_TYPES, CARD_VALUES } from './deckGenerator';

/**
 * Checks if a card is playable given the top card of discard pile and the current active color.
 * 
 * @param {Object} card - The card to check.
 * @param {Object} topCard - The top card of the discard pile.
 * @param {string} currentColor - The active color of the board (red, blue, green, yellow).
 * @param {Array} playerHand - The hand of the player attempting to play.
 * @returns {boolean} - True if playable, false otherwise.
 */
export const isValidMove = (card, topCard, currentColor, playerHand = []) => {
  if (!topCard) return true;

  // Wild card is always playable
  if (card.value === CARD_VALUES.WILD) {
    return true;
  }

  // Wild Draw Four can only be played if the player has no cards in hand matching the current active color
  if (card.value === CARD_VALUES.WILD_DRAW_FOUR) {
    const hasMatchingColor = playerHand.some(
      handCard => handCard.color === currentColor && handCard.color !== 'wild'
    );
    return !hasMatchingColor;
  }

  // Check matching color
  if (card.color === currentColor) {
    return true;
  }

  // Check matching value (e.g. 5 matches 5, skip matches skip)
  if (card.value === topCard.value) {
    return true;
  }

  return false;
};

/**
 * Checks if a player has any valid moves in their hand.
 * 
 * @param {Array} hand - Player's hand of cards.
 * @param {Object} topCard - Top card of discard pile.
 * @param {string} currentColor - Active color of the game.
 * @returns {boolean} - True if the player has at least one valid card.
 */
export const hasValidMoves = (hand, topCard, currentColor) => {
  return hand.some(card => isValidMove(card, topCard, currentColor, hand));
};
