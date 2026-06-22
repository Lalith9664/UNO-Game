export const CARD_COLORS = ['red', 'blue', 'green', 'yellow'];

export const CARD_TYPES = {
  NUMBER: 'number',
  ACTION: 'action',
  WILD: 'wild'
};

export const CARD_VALUES = {
  SKIP: 'skip',
  REVERSE: 'reverse',
  DRAW_TWO: 'draw2',
  WILD: 'wild',
  WILD_DRAW_FOUR: 'wild4'
};

/**
 * Generates a standard 108-card UNO deck.
 * - 4 colors: red, blue, green, yellow
 * - 1 x '0' card per color
 * - 2 x '1'-'9' cards per color
 * - 2 x 'Skip', 'Reverse', 'Draw Two' (+2) per color
 * - 4 x 'Wild' cards
 * - 4 x 'Wild Draw Four' (+4) cards
 */
export const generateDeck = () => {
  const deck = [];
  let idCounter = 0;

  CARD_COLORS.forEach(color => {
    // '0' Card (1 per color)
    deck.push({
      id: `${color}-0-${idCounter++}`,
      color,
      value: '0',
      type: CARD_TYPES.NUMBER,
      score: 0
    });

    // '1' to '9' Cards (2 per color)
    for (let num = 1; num <= 9; num++) {
      const valStr = num.toString();
      deck.push({
        id: `${color}-${valStr}-a-${idCounter++}`,
        color,
        value: valStr,
        type: CARD_TYPES.NUMBER,
        score: num
      });
      deck.push({
        id: `${color}-${valStr}-b-${idCounter++}`,
        color,
        value: valStr,
        type: CARD_TYPES.NUMBER,
        score: num
      });
    }

    // Action Cards (2 of each per color)
    const actionTypes = [
      { val: CARD_VALUES.SKIP, score: 20 },
      { val: CARD_VALUES.REVERSE, score: 20 },
      { val: CARD_VALUES.DRAW_TWO, score: 20 }
    ];

    actionTypes.forEach(action => {
      deck.push({
        id: `${color}-${action.val}-a-${idCounter++}`,
        color,
        value: action.val,
        type: CARD_TYPES.ACTION,
        score: action.score
      });
      deck.push({
        id: `${color}-${action.val}-b-${idCounter++}`,
        color,
        value: action.val,
        type: CARD_TYPES.ACTION,
        score: action.score
      });
    });
  });

  // Wild Cards (4 of each)
  for (let i = 0; i < 4; i++) {
    deck.push({
      id: `wild-color-${i}-${idCounter++}`,
      color: 'wild', // Default color, will be chosen when played
      value: CARD_VALUES.WILD,
      type: CARD_TYPES.WILD,
      score: 50
    });
    deck.push({
      id: `wild-draw4-${i}-${idCounter++}`,
      color: 'wild', // Default color, will be chosen when played
      value: CARD_VALUES.WILD_DRAW_FOUR,
      type: CARD_TYPES.WILD,
      score: 50
    });
  }

  return deck;
};
