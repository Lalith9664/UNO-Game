export const rulesSections = [
  {
    id: "objective",
    title: "1. Game Objective",
    content: "The main goal of UNO is to be the first player to discard all of the cards in your hand. You score points in each round for the cards left in your opponents' hands, or simply compete to win the match. The game ends as soon as one player has successfully played all of their cards.",
    tags: ["goal", "win", "objective", "score"]
  },
  {
    id: "setup",
    title: "2. Game Setup",
    content: "UNO supports 2 to 9 players. Each player starts with 7 cards dealt face down. The remaining cards form the Draw Pile (placed in the center). The top card of the Draw Pile is turned over to start a Discard Pile. If the first card is a Wild or Wild Draw Four, it is returned to the deck, and another is drawn.",
    tags: ["deal", "setup", "start", "draw pile", "discard pile"]
  },
  {
    id: "turn-rules",
    title: "3. Turn Rules",
    content: "On your turn, you must match a card from your hand to the card on the top of the Discard Pile. Matches can be based on Color (Red, Blue, Green, Yellow), Number (0-9), or Symbol (Skip, Reverse, Draw Two). Alternatively, you can play a Wild Card. If you do not have a match, you must draw a card.",
    tags: ["turn", "match", "color", "number", "play"]
  },
  {
    id: "drawing-cards",
    title: "4. Drawing Cards",
    content: "If you cannot play a card, you must draw one card from the Draw Pile. If the drawn card is playable (matches the color, number, or is a Wild card), you can choose to play it immediately. If it is not playable, or if you choose not to play it, your turn ends automatically.",
    tags: ["draw", "no move", "pile", "skip turn"]
  },
  {
    id: "skip-card",
    title: "5. Skip Card",
    content: "When played, the next player in the current rotation direction loses their turn and is skipped. In a clockwise game, playing this card skips the player to your left; in a counter-clockwise game, it skips the player to your right.",
    tags: ["skip", "action", "turn", "next player"]
  },
  {
    id: "reverse-card",
    title: "6. Reverse Card",
    content: "Reverses the direction of play. If play is moving clockwise, it changes to counter-clockwise, and vice versa. SPECIAL RULE: In a 2-player game, the Reverse card acts exactly like a Skip card (the other player is skipped, and you immediately get another turn).",
    tags: ["reverse", "direction", "clockwise", "2-player"]
  },
  {
    id: "draw-two-card",
    title: "7. Draw Two Card (+2)",
    content: "When played, the next player in sequence must draw 2 cards from the Draw Pile and completely forfeit their turn (they are skipped). This card can only be played on a matching color or on another Draw Two card.",
    tags: ["draw two", "draw 2", "penalty", "action"]
  },
  {
    id: "wild-card",
    title: "8. Wild Card",
    content: "Allows the player to declare the next active color of play (Red, Blue, Green, or Yellow). A Wild card can be played on any card, even if the player has other playable cards in their hand. Once placed, the player selects the new color via a pop-up menu.",
    tags: ["wild", "color picker", "any card"]
  },
  {
    id: "wild-draw-four",
    title: "9. Wild Draw Four Card (+4)",
    content: "The ultimate action card. Allows the player to choose the active color AND forces the next player to draw 4 cards and skip their turn. RESTRICTION: You may only play this card if you do NOT have any card in your hand that matches the current color on the Discard Pile.",
    tags: ["wild draw four", "wild 4", "draw 4", "restriction"]
  },
  {
    id: "uno-rules",
    title: "10. UNO Rules",
    content: "When you have only 1 card remaining in your hand, you must declare 'UNO' by pressing the UNO button before completing your turn. If you finish your turn (by playing your second-to-last card) and another player catches you before the next player starts their turn, you suffer a penalty.",
    tags: ["uno", "one card", "call", "declaration"]
  },
  {
    id: "winning-rules",
    title: "11. Winning Rules",
    content: "A player wins the round as soon as they discard their final card. The game tracks stats like the winner's name, total turns taken, cards played, and the round duration. In tournaments, points are tallied: Number cards (face value), Action cards (20 pts), Wilds (50 pts). First to 500 wins the overall match.",
    tags: ["winner", "stats", "score", "end game"]
  },
  {
    id: "multiplayer-rules",
    title: "12. Multiplayer Rules",
    content: "UNO is designed around a circular game table. Up to 9 players can participate. Players are seated in a ring. The current player's cards are visible at the bottom, while other players' card counts are shown beside their avatars. Play moves in a highlighted circular loop.",
    tags: ["table", "circle", "multiplayer", "avatars"]
  },
  {
    id: "penalties",
    title: "13. Penalties",
    content: "If you fail to call 'UNO' when down to your last card and are caught by another player, you must immediately draw 2 penalty cards from the Draw Pile. If a player plays an illegal Wild Draw Four card (i.e. they actually possessed a card matching the active color), they can be challenged (house rules).",
    tags: ["penalty", "punish", "catch", "draw two"]
  }
];

export const faqData = [
  {
    question: "What does Reverse do?",
    answer: "The Reverse card reverses the direction of play. Clockwise becomes counter-clockwise, and counter-clockwise becomes clockwise. In a 2-player game, playing a Reverse card behaves exactly like a Skip card."
  },
  {
    question: "What does Skip do?",
    answer: "A Skip card forces the next player in the current direction of play to lose their turn, skipping past them to the subsequent player."
  },
  {
    question: "What does Wild Draw Four do?",
    answer: "A Wild Draw Four card lets you select the active play color, forces the next player to draw 4 cards from the draw pile, and skips their turn. Legally, you can only play it if you don't hold a card matching the current color."
  },
  {
    question: "What happens if I forget to press UNO?",
    answer: "If you do not press the 'UNO' button before ending your turn while having exactly 1 card left, and you are caught, you must draw 2 penalty cards as a consequence."
  },
  {
    question: "How many players can join?",
    answer: "Our React UNO version supports between 2 and 9 players. You can dynamically add, remove, and rename players in the lobby before starting the match."
  }
];
