import React, { createContext, useState, useEffect, useRef } from 'react';
import { generateDeck, CARD_VALUES, CARD_TYPES } from '../utils/deckGenerator';
import { io } from 'socket.io-client';
import { shuffle } from '../utils/shuffle';
import { isValidMove, hasValidMoves } from '../utils/gameRules';
import { getNextTurn, calculateHandScore, getAvatarGradient, playSynthSound } from '../utils/gameHelpers';

export const GameContext = createContext();

const DEFAULT_SETTINGS = {
  soundOn: true,
  darkMode: true,
  animationSpeed: 'normal',
  turnTimer: 15, // seconds (null for off)
  playerLimit: 9
};

const INITIAL_PLAYERS = [
  { id: 'p1', name: 'Player 1', hand: [], avatarGradient: getAvatarGradient(0), isBot: false, declaredUno: false, stats: { cardsPlayed: 0, turnsTaken: 0 } },
  { id: 'p2', name: 'Player 2', hand: [], avatarGradient: getAvatarGradient(1), isBot: false, declaredUno: false, stats: { cardsPlayed: 0, turnsTaken: 0 } },
  { id: 'p3', name: 'Player 3', hand: [], avatarGradient: getAvatarGradient(2), isBot: false, declaredUno: false, stats: { cardsPlayed: 0, turnsTaken: 0 } },
  { id: 'p4', name: 'Player 4', hand: [], avatarGradient: getAvatarGradient(3), isBot: false, declaredUno: false, stats: { cardsPlayed: 0, turnsTaken: 0 } }
];

export const GameProvider = ({ children }) => {
  // Game settings
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('uno_settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  // Game Lobby / Stage state
  const [gameStage, setGameStage] = useState('setup'); // 'setup' | 'playing' | 'ended'
  const [lobbyPlayers, setLobbyPlayers] = useState(INITIAL_PLAYERS);

  // Multiplayer online state
  const [socket, setSocket] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [myPlayerId, setMyPlayerId] = useState('');
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [multiplayerError, setMultiplayerError] = useState('');

  const socketRef = useRef(null);
  const stateRef = useRef();



  // Active game state
  const [players, setPlayers] = useState([]);
  const [drawPile, setDrawPile] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [direction, setDirection] = useState('clockwise'); // 'clockwise' | 'counter-clockwise'
  const [currentColor, setCurrentColor] = useState('');
  const [winner, setWinner] = useState(null);
  
  // Game events & logs
  const [moveHistory, setMoveHistory] = useState([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingWildCard, setPendingWildCard] = useState(null);
  const [hasDrawnThisTurn, setHasDrawnThisTurn] = useState(false);
  const [drawnCard, setDrawnCard] = useState(null); // Keep track of the card just drawn for instant play option
  const [unoAlert, setUnoAlert] = useState(null); // { playerName, message }

  // Toast notification state
  const [toast, setToast] = useState(null); // { message, type: 'error' | 'info' }
  const toastTimeoutRef = useRef(null);

  // Turn timer state
  const [timerValue, setTimerValue] = useState(settings.turnTimer);
  const timerIntervalRef = useRef(null);

  // Match statistics
  const [matchStats, setMatchStats] = useState({
    startTime: null,
    duration: 0,
    totalTurns: 0
  });

  // Sound triggers helper
  const playSound = (type) => {
    playSynthSound(type, !settings.soundOn);
  };

  // Toast notification helper
  const showToast = (message, type = 'error') => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Helper to get active player ID
  const getActivePlayerId = () => {
    return players[currentTurn]?.id || null;
  };

  // Sync Dark Mode theme with HTML element
  useEffect(() => {
    const root = window.document.documentElement;
    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('uno_settings', JSON.stringify(settings));
  }, [settings]);

  // Turn Timer Countdown Effect
  useEffect(() => {
    if (gameStage !== 'playing' || !settings.turnTimer || winner || showColorPicker) {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      return;
    }

    setTimerValue(settings.turnTimer);

    timerIntervalRef.current = setInterval(() => {
      setTimerValue((prev) => {
        if (prev <= 1) {
          // Time's up! Force draw card and end turn
          handleTimeout();
          return settings.turnTimer;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameStage, currentTurn, settings.turnTimer, winner, showColorPicker]);

  const handleTimeout = () => {
    if (isMultiplayer && !isHost) return; // Only host handles timeout
    const activePlayer = players[currentTurn];
    addLog(`${activePlayer.name} ran out of time!`);
    
    // Draw card automatically
    let cardDrawn = null;
    let updatedDrawPile = [...drawPile];
    let updatedDiscardPile = [...discardPile];

    if (updatedDrawPile.length === 0) {
      const reshuffled = reshuffleDeck(updatedDiscardPile);
      updatedDrawPile = reshuffled.draw;
      updatedDiscardPile = reshuffled.discard;
    }

    if (updatedDrawPile.length > 0) {
      cardDrawn = updatedDrawPile.pop();
      playSound('draw');
      
      const updatedPlayers = players.map((player, idx) => {
        if (idx === currentTurn) {
          return {
            ...player,
            hand: [...player.hand, cardDrawn],
            declaredUno: false // reset Uno if drawing cards
          };
        }
        return player;
      });

      setPlayers(updatedPlayers);
      setDrawPile(updatedDrawPile);
      setDiscardPile(updatedDiscardPile);
      addLog(`${activePlayer.name} drew 1 card.`);
    }

    // Auto-advance turn
    passTurn();
  };

  // Add event log helper
  const addLog = (text) => {
    setMoveHistory((prev) => [
      {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      },
      ...prev
    ]);
  };

  // Lobby management
  const addLobbyPlayer = (name) => {
    if (lobbyPlayers.length >= settings.playerLimit) return;
    const newId = `p_${Date.now()}`;
    const nextIdx = lobbyPlayers.length;
    setLobbyPlayers([
      ...lobbyPlayers,
      {
        id: newId,
        name: name || `Player ${nextIdx + 1}`,
        hand: [],
        avatarGradient: getAvatarGradient(nextIdx),
        isBot: false,
        declaredUno: false,
        stats: { cardsPlayed: 0, turnsTaken: 0 }
      }
    ]);
    playSound('click');
  };

  const removeLobbyPlayer = (id) => {
    if (lobbyPlayers.length <= 2) return; // Minimum 2 players
    setLobbyPlayers(lobbyPlayers.filter(p => p.id !== id).map((p, idx) => ({
      ...p,
      avatarGradient: getAvatarGradient(idx)
    })));
    playSound('click');
  };

  const updateLobbyPlayerName = (id, newName) => {
    setLobbyPlayers(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
    
    if (stateRef.current && stateRef.current.isMultiplayer && id === stateRef.current.myPlayerId && socketRef.current) {
      socketRef.current.emit('renamePlayerInRoom', {
        roomCode: stateRef.current.roomCode,
        playerId: id,
        newName
      });
    }
  };

  // Reshuffle draw pile from discard pile
  const reshuffleDeck = (currentDiscard) => {
    if (currentDiscard.length <= 1) {
      // Nothing to reshuffle, create fresh deck
      const freshDeck = shuffle(generateDeck());
      addLog("Draw pile empty! Shuffled a fresh deck.");
      return { draw: freshDeck, discard: currentDiscard };
    }
    const topCard = currentDiscard[currentDiscard.length - 1];
    const cardsToShuffle = currentDiscard.slice(0, -1).map(c => {
      // Reset color of wild cards back to 'wild'
      if (c.type === CARD_TYPES.WILD) {
        return { ...c, color: 'wild' };
      }
      return c;
    });
    
    addLog("Shuffled the discard pile back into the draw pile.");
    return {
      draw: shuffle(cardsToShuffle),
      discard: [topCard]
    };
  };

  // Start the Game
  const startGame = () => {
    if (lobbyPlayers.length < 2 || lobbyPlayers.length > 9) return;
    if (isMultiplayer && !isHost) return; // Only host can start game

    playSound('play');
    let deck = shuffle(generateDeck());

    // Deal 7 cards to each player
    const initializedPlayers = lobbyPlayers.map(player => {
      const hand = [];
      for (let i = 0; i < 7; i++) {
        if (deck.length > 0) {
          hand.push(deck.pop());
        }
      }
      return {
        ...player,
        hand,
        declaredUno: false,
        stats: { cardsPlayed: 0, turnsTaken: 0 }
      };
    });

    // Determine starter card
    let startCard = deck.pop();
    // If starter card is Wild Draw Four, put it back and draw again
    while (startCard.value === CARD_VALUES.WILD_DRAW_FOUR) {
      deck.unshift(startCard);
      deck = shuffle(deck);
      startCard = deck.pop();
    }

    const initialDiscard = [startCard];
    let startColor = startCard.color;

    // Set active color to red if start card is wild
    if (startCard.color === 'wild') {
      startColor = 'red'; // default color for initial wild card
    }

    setPlayers(initializedPlayers);
    setDrawPile(deck);
    setDiscardPile(initialDiscard);
    setCurrentTurn(0);
    setDirection('clockwise');
    setCurrentColor(startColor);
    setWinner(null);
    setHasDrawnThisTurn(false);
    setDrawnCard(null);
    setShowColorPicker(false);
    setPendingWildCard(null);
    setUnoAlert(null);
    setToast(null);
    setMoveHistory([]);
    setMatchStats({
      startTime: Date.now(),
      duration: 0,
      totalTurns: 0
    });
    setGameStage('playing');

    addLog(`Game started with ${initializedPlayers.length} players!`);
    addLog(`Starter card is ${startCard.color.toUpperCase()} ${startCard.value.toUpperCase()}.`);

    // Handle starting card special effects (Skip, Reverse, Draw Two)
    // Applied to the first player (index 0)
    if (startCard.value === CARD_VALUES.SKIP) {
      addLog(`${initializedPlayers[0].name} was skipped by the starter card!`);
      setCurrentTurn(1 % initializedPlayers.length);
    } else if (startCard.value === CARD_VALUES.REVERSE) {
      addLog(`Play direction reversed by the starter card!`);
      if (initializedPlayers.length === 2) {
        addLog(`${initializedPlayers[0].name} was skipped!`);
        setCurrentTurn(1 % initializedPlayers.length);
      } else {
        setDirection('counter-clockwise');
        setCurrentTurn(0); // Starts clockwise/counter-clockwise from player 0
      }
    } else if (startCard.value === CARD_VALUES.DRAW_TWO) {
      addLog(`${initializedPlayers[0].name} must draw 2 cards and is skipped!`);
      // Deal 2 cards
      const updatedPlayers = [...initializedPlayers];
      const p1Cards = [deck.pop(), deck.pop()];
      updatedPlayers[0].hand.push(...p1Cards);
      setPlayers(updatedPlayers);
      setDrawPile(deck);
      setCurrentTurn(1 % initializedPlayers.length);
    }
  };

  // Draw Card action
  const drawCard = (requestingPlayerId = null) => {
    if (gameStage !== 'playing' || hasDrawnThisTurn || showColorPicker) return;
    
    if (isMultiplayer) {
      if (players[currentTurn]?.id !== myPlayerId) {
        showToast("It's not your turn.");
        return;
      }
      if (!isHost) {
        socketRef.current.emit('emitPlayerAction', {
          roomCode,
          action: { type: 'drawCard', playerId: myPlayerId }
        });
        return;
      }
    }

    let updatedDrawPile = [...drawPile];
    let updatedDiscardPile = [...discardPile];

    if (updatedDrawPile.length === 0) {
      const reshuffled = reshuffleDeck(updatedDiscardPile);
      updatedDrawPile = reshuffled.draw;
      updatedDiscardPile = reshuffled.discard;
    }

    if (updatedDrawPile.length === 0) {
      addLog("No cards left to draw!");
      return;
    }

    const card = updatedDrawPile.pop();
    playSound('draw');

    const activePlayer = players[currentTurn];
    const isPlayable = isValidMove(card, updatedDiscardPile[updatedDiscardPile.length - 1], currentColor, activePlayer.hand);

    const updatedPlayers = players.map((player, idx) => {
      if (idx === currentTurn) {
        return {
          ...player,
          hand: [...player.hand, card],
          declaredUno: false // reset Uno status since they drew a card
        };
      }
      return player;
    });

    setPlayers(updatedPlayers);
    setDrawPile(updatedDrawPile);
    setDiscardPile(updatedDiscardPile);
    setHasDrawnThisTurn(true);
    setDrawnCard(card);

    addLog(`${activePlayer.name} drew 1 card.`);

    // If card is not playable, end the turn automatically after a brief delay
    if (!isPlayable) {
      addLog(`${card.type === 'wild' ? 'Wild' : card.color.toUpperCase() + ' ' + card.value.toUpperCase()} drawn is not playable.`);
      setTimeout(() => {
        passTurn();
      }, 1000);
    } else {
      addLog(`${card.type === 'wild' ? 'Wild' : card.color.toUpperCase() + ' ' + card.value.toUpperCase()} drawn is playable! Choose to play or pass.`);
    }
  };

  // Pass Turn action (after drawing and deciding not to play)
  const passTurn = (requestingPlayerId = null) => {
    if (gameStage !== 'playing' || showColorPicker) return;
    
    if (isMultiplayer) {
      if (players[currentTurn]?.id !== myPlayerId) { showToast("It's not your turn."); return; } // Not your turn
      if (!isHost) {
        socketRef.current.emit('emitPlayerAction', {
          roomCode,
          action: { type: 'passTurn', playerId: myPlayerId }
        });
        return;
      }
    }
    
    const activePlayer = players[currentTurn];
    addLog(`${activePlayer.name} passed.`);
    
    // Check UNO penalty before passing
    checkUnoPenalty();
    
    // Reset draw states
    setHasDrawnThisTurn(false);
    setDrawnCard(null);
    
    // Increment total turns
    setMatchStats(prev => ({ ...prev, totalTurns: prev.totalTurns + 1 }));

    // Move to next player
    const nextIdx = getNextTurn(currentTurn, direction, players.length);
    setCurrentTurn(nextIdx);
  };

  // Play Card action
  const playCard = (cardId, requestingPlayerId = null) => {
    if (gameStage !== 'playing' || showColorPicker) return;
    
    if (isMultiplayer) {
      if (players[currentTurn]?.id !== myPlayerId) { showToast("It's not your turn."); return; } // Not your turn
      if (!isHost) {
        socketRef.current.emit('emitPlayerAction', {
          roomCode,
          action: { type: 'playCard', cardId, playerId: myPlayerId }
        });
        return;
      }
    }

    const activePlayer = players[currentTurn];
    const cardToPlay = activePlayer.hand.find(c => c.id === cardId);
    
    if (!cardToPlay) return;

    const topCard = discardPile[discardPile.length - 1];

    // Validate play
    if (!isValidMove(cardToPlay, topCard, currentColor, activePlayer.hand)) {
      addLog(`Invalid move! Can't play ${cardToPlay.color} ${cardToPlay.value} on ${topCard.color} ${topCard.value}.`);
      playSound('penalty');
      return;
    }

    // Play card
    playSound(cardToPlay.type === 'wild' ? 'wild' : 'play');
    
    // Handle Wild card color picking
    if (cardToPlay.type === CARD_TYPES.WILD) {
      setPendingWildCard(cardToPlay);
      setShowColorPicker(true);
      return; // Do not complete play/advance turn until color is selected
    }

    // Normal or Action Card play
    executeCardPlay(cardToPlay);
  };

  // Helper to execute card play once color is confirmed (or immediately for non-wild cards)
  const executeCardPlay = (card, chosenColor = null) => {
    const activePlayer = players[currentTurn];
    const topCard = discardPile[discardPile.length - 1];

    let updatedCard = { ...card };
    if (chosenColor) {
      updatedCard.color = chosenColor;
    }

    // Remove from player's hand and update player stats
    const updatedPlayers = players.map((player, idx) => {
      if (idx === currentTurn) {
        return {
          ...player,
          hand: player.hand.filter(c => c.id !== card.id),
          stats: {
            ...player.stats,
            cardsPlayed: player.stats.cardsPlayed + 1,
            turnsTaken: player.stats.turnsTaken + 1
          }
        };
      }
      return player;
    });

    const updatedDiscardPile = [...discardPile, updatedCard];
    
    // Check if player won round
    const playerHandAfterPlay = updatedPlayers[currentTurn].hand;
    if (playerHandAfterPlay.length === 0) {
      setPlayers(updatedPlayers);
      setDiscardPile(updatedDiscardPile);
      handleWin(updatedPlayers[currentTurn]);
      return;
    }

    // Determine next turn increment and effects
    let skipCount = 1;
    let newDirection = direction;
    let nextActiveColor = chosenColor || card.color;
    
    let effectText = '';

    if (card.value === CARD_VALUES.SKIP) {
      skipCount = 2;
      const skippedPlayer = players[getNextTurn(currentTurn, direction, players.length)];
      effectText = ` ${skippedPlayer.name} is SKIPPED!`;
    } else if (card.value === CARD_VALUES.REVERSE) {
      if (players.length === 2) {
        // In 2-player game, Reverse acts as Skip
        skipCount = 2;
        const skippedPlayer = players[getNextTurn(currentTurn, direction, players.length)];
        effectText = ` ${skippedPlayer.name} is SKIPPED!`;
      } else {
        newDirection = direction === 'clockwise' ? 'counter-clockwise' : 'clockwise';
        effectText = ` Direction changed to ${newDirection.toUpperCase()}!`;
      }
    } else if (card.value === CARD_VALUES.DRAW_TWO) {
      skipCount = 2;
      const targetPlayerIndex = getNextTurn(currentTurn, direction, players.length);
      const targetPlayer = players[targetPlayerIndex];
      
      effectText = ` ${targetPlayer.name} draws 2 cards and is SKIPPED!`;
      
      // Force draw cards
      let updatedDrawPile = [...drawPile];
      let dealCards = [];
      for (let i = 0; i < 2; i++) {
        if (updatedDrawPile.length === 0) {
          const reshuffled = reshuffleDeck(updatedDiscardPile);
          updatedDrawPile = reshuffled.draw;
        }
        if (updatedDrawPile.length > 0) {
          dealCards.push(updatedDrawPile.pop());
        }
      }

      updatedPlayers[targetPlayerIndex] = {
        ...updatedPlayers[targetPlayerIndex],
        hand: [...updatedPlayers[targetPlayerIndex].hand, ...dealCards],
        declaredUno: false // Reset UNO status
      };

      setDrawPile(updatedDrawPile);
    } else if (card.value === CARD_VALUES.WILD_DRAW_FOUR) {
      skipCount = 2;
      const targetPlayerIndex = getNextTurn(currentTurn, direction, players.length);
      const targetPlayer = players[targetPlayerIndex];
      
      effectText = ` chosen color is ${chosenColor.toUpperCase()}. ${targetPlayer.name} draws 4 cards and is SKIPPED!`;

      // Force draw cards
      let updatedDrawPile = [...drawPile];
      let dealCards = [];
      for (let i = 0; i < 4; i++) {
        if (updatedDrawPile.length === 0) {
          const reshuffled = reshuffleDeck(updatedDiscardPile);
          updatedDrawPile = reshuffled.draw;
        }
        if (updatedDrawPile.length > 0) {
          dealCards.push(updatedDrawPile.pop());
        }
      }

      updatedPlayers[targetPlayerIndex] = {
        ...updatedPlayers[targetPlayerIndex],
        hand: [...updatedPlayers[targetPlayerIndex].hand, ...dealCards],
        declaredUno: false // Reset UNO status
      };

      setDrawPile(updatedDrawPile);
    }

    addLog(`${activePlayer.name} played ${card.type === 'wild' ? 'Wild' : card.color.toUpperCase()} ${card.value.toUpperCase()}.${effectText}`);

    // Check UNO declaration penalty before changing active turn
    // If the active player has exactly 1 card left and did NOT declare UNO, they must draw 2 cards penalty!
    let penaltyApplied = false;
    if (playerHandAfterPlay.length === 1 && !updatedPlayers[currentTurn].declaredUno) {
      penaltyApplied = true;
      playSound('penalty');
      
      let updatedDrawPile = [...drawPile];
      let penaltyCards = [];
      for (let i = 0; i < 2; i++) {
        if (updatedDrawPile.length === 0) {
          const reshuffled = reshuffleDeck(updatedDiscardPile);
          updatedDrawPile = reshuffled.draw;
        }
        if (updatedDrawPile.length > 0) {
          penaltyCards.push(updatedDrawPile.pop());
        }
      }

      updatedPlayers[currentTurn] = {
        ...updatedPlayers[currentTurn],
        hand: [...updatedPlayers[currentTurn].hand, ...penaltyCards]
      };

      setDrawPile(updatedDrawPile);
      addLog(`PENALTY! ${activePlayer.name} forgot to call UNO! Drew 2 cards.`);
      triggerUnoAlert(activePlayer.name, "Forgot to declare UNO! Drew 2 cards penalty.");
    }

    // Save state
    setPlayers(updatedPlayers);
    setDiscardPile(updatedDiscardPile);
    setDirection(newDirection);
    setCurrentColor(nextActiveColor);
    setHasDrawnThisTurn(false);
    setDrawnCard(null);
    setMatchStats(prev => ({ ...prev, totalTurns: prev.totalTurns + 1 }));

    // Advance turn
    const nextIdx = getNextTurn(currentTurn, newDirection, updatedPlayers.length, skipCount);
    setCurrentTurn(nextIdx);
  };

  // Handle color selection for Wild / Wild 4
  const selectWildColor = (color, requestingPlayerId = null) => {
    if (!pendingWildCard) return;
    
    if (isMultiplayer) {
      if (players[currentTurn]?.id !== myPlayerId) { showToast("It's not your turn."); return; } // Not your turn
      if (!isHost) {
        socketRef.current.emit('emitPlayerAction', {
          roomCode,
          action: { type: 'selectWildColor', color, playerId: myPlayerId }
        });
        return;
      }
    }
    
    const card = pendingWildCard;
    setPendingWildCard(null);
    setShowColorPicker(false);
    
    executeCardPlay(card, color);
  };

  // Declare UNO
  const declareUno = (requestingPlayerId = null) => {
    if (gameStage !== 'playing') return;
    
    if (isMultiplayer) {
      if (players[currentTurn]?.id !== myPlayerId) { showToast("It's not your turn."); return; } // Not your turn
      if (!isHost) {
        socketRef.current.emit('emitPlayerAction', {
          roomCode,
          action: { type: 'declareUno', playerId: myPlayerId }
        });
        return;
      }
    }

    // Check if the current player is eligible to call UNO (either has 1 card, or has 2 cards and is about to play/draw)
    const activePlayer = players[currentTurn];
    
    // Setting declared UNO
    const updatedPlayers = players.map((player, idx) => {
      if (idx === currentTurn) {
        return {
          ...player,
          declaredUno: true
        };
      }
      return player;
    });

    setPlayers(updatedPlayers);
    playSound('uno');
    addLog(`${activePlayer.name} declared UNO! 📢`);
    triggerUnoAlert(activePlayer.name, "Declared UNO! 📢");
  };

  // Helper to trigger UI Uno Alert
  const triggerUnoAlert = (playerName, message) => {
    setUnoAlert({ playerName, message });
    setTimeout(() => {
      setUnoAlert(null);
    }, 3000);
  };

  // Verification helper for Uno Penalty before passing turn
  const checkUnoPenalty = () => {
    const activePlayer = players[currentTurn];
    if (activePlayer.hand.length === 1 && !activePlayer.declaredUno) {
      playSound('penalty');
      
      let updatedDrawPile = [...drawPile];
      let updatedDiscardPile = [...discardPile];
      let penaltyCards = [];
      for (let i = 0; i < 2; i++) {
        if (updatedDrawPile.length === 0) {
          const reshuffled = reshuffleDeck(updatedDiscardPile);
          updatedDrawPile = reshuffled.draw;
          updatedDiscardPile = reshuffled.discard;
        }
        if (updatedDrawPile.length > 0) {
          penaltyCards.push(updatedDrawPile.pop());
        }
      }

      const updatedPlayers = players.map((player, idx) => {
        if (idx === currentTurn) {
          return {
            ...player,
            hand: [...player.hand, ...penaltyCards]
          };
        }
        return player;
      });

      setPlayers(updatedPlayers);
      setDrawPile(updatedDrawPile);
      setDiscardPile(updatedDiscardPile);
      
      addLog(`PENALTY! ${activePlayer.name} forgot to call UNO! Drew 2 cards.`);
      triggerUnoAlert(activePlayer.name, "Forgot to declare UNO! Drew 2 cards penalty.");
    }
  };

  // Handle game winner
  const handleWin = (winningPlayer) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    playSound('win');
    const duration = Math.floor((Date.now() - matchStats.startTime) / 1000);
    
    setMatchStats(prev => ({
      ...prev,
      duration
    }));

    setWinner(winningPlayer);
    setGameStage('ended');
    addLog(`👑 ${winningPlayer.name} WON the match in ${duration}s after ${matchStats.totalTurns} turns!`);
  };

  // Play Again (same players, new deck)
  const playAgain = () => {
    if (isMultiplayer && !isHost) return;
    startGame();
  };

  // Back to setup lobby
  const quitToLobby = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    
    if (isMultiplayer) {
      if (!isHost) {
        leaveOnlineRoom();
        return;
      }
    }
    
    setPlayers([]);
    setDrawPile([]);
    setDiscardPile([]);
    setWinner(null);
    setGameStage('setup');
    playSound('click');
  };

  // Reset Game completely
  const resetGame = () => {
    quitToLobby();
    setLobbyPlayers(INITIAL_PLAYERS);
  };

  // Settings modification
  const updateSettings = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  stateRef.current = {
    settings,
    gameStage,
    lobbyPlayers,
    players,
    drawPile,
    discardPile,
    currentTurn,
    direction,
    currentColor,
    winner,
    moveHistory,
    showColorPicker,
    pendingWildCard,
    hasDrawnThisTurn,
    drawnCard,
    timerValue,
    matchStats,
    unoAlert,
    isHost,
    roomCode,
    myPlayerId,
    isMultiplayer
  };

  const initSocket = () => {
    if (socketRef.current) return socketRef.current;
    
    console.log('Initializing socket connection to:', window.location.origin);
    const newSocket = io(window.location.origin, {
      autoConnect: true,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('Socket connected successfully with ID:', newSocket.id);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      showToast(`Connection error: ${err.message}. Check your port forward settings.`);
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('Socket disconnected:', reason);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
    return newSocket;
  };

  const setupSocketListeners = (socketInst) => {
    socketInst.off('playerJoined');
    socketInst.off('playerLeft');
    socketInst.off('roomPlayersUpdated');
    socketInst.off('newHostAssigned');
    socketInst.off('gameStateSynced');
    socketInst.off('hostRequestRename');
    socketInst.off('processPlayerAction');

    socketInst.on('playerJoined', ({ players: updatedPlayers, newPlayer }) => {
      setLobbyPlayers(updatedPlayers);
      addLog(`${newPlayer.name} joined the room!`);
      playSound('click');
    });

    socketInst.on('playerLeft', ({ playerId, players: updatedPlayers }) => {
      const leavingPlayer = stateRef.current.lobbyPlayers.find(p => p.id === playerId) || 
                            stateRef.current.players.find(p => p.id === playerId);
      const name = leavingPlayer ? leavingPlayer.name : 'A player';
      addLog(`${name} disconnected.`);
      setLobbyPlayers(updatedPlayers);
      
      if (stateRef.current.gameStage === 'playing') {
        setPlayers(prevPlayers => {
          const nextPlayers = prevPlayers.filter(p => p.id !== playerId);
          if (stateRef.current.currentTurn >= nextPlayers.length) {
            setCurrentTurn(0);
          }
          return nextPlayers;
        });
      }
    });

    socketInst.on('roomPlayersUpdated', ({ players: updatedPlayers }) => {
      setLobbyPlayers(updatedPlayers);
    });

    socketInst.on('newHostAssigned', ({ hostPlayerId, players: updatedPlayers }) => {
      setLobbyPlayers(updatedPlayers);
      if (stateRef.current.myPlayerId === hostPlayerId) {
        setIsHost(true);
        addLog("You are now the room host!");
      }
    });

    socketInst.on('gameStateSynced', (syncedState) => {
      if (stateRef.current.isHost) return;

      setGameStage(syncedState.gameStage);
      setLobbyPlayers(syncedState.lobbyPlayers);
      setPlayers(syncedState.players);
      setDrawPile(syncedState.drawPile);
      setDiscardPile(syncedState.discardPile);
      setCurrentTurn(syncedState.currentTurn);
      setDirection(syncedState.direction);
      setCurrentColor(syncedState.currentColor);
      setWinner(syncedState.winner);
      setMoveHistory(syncedState.moveHistory);
      setShowColorPicker(syncedState.showColorPicker);
      setPendingWildCard(syncedState.pendingWildCard);
      setHasDrawnThisTurn(syncedState.hasDrawnThisTurn);
      setDrawnCard(syncedState.drawnCard);
      setUnoAlert(syncedState.unoAlert);
      setTimerValue(syncedState.timerValue);
      setMatchStats(syncedState.matchStats);
    });

    socketInst.on('hostRequestRename', ({ playerId, newName }) => {
      if (!stateRef.current.isHost) return;
      updateLobbyPlayerName(playerId, newName);
    });

    socketInst.on('processPlayerAction', (action) => {
      if (!stateRef.current.isHost) return;
      
      const currentActive = stateRef.current.players[stateRef.current.currentTurn];
      if (!currentActive || currentActive.id !== action.playerId) {
        console.log(`Action rejected: not your turn.`);
        return;
      }

      switch (action.type) {
        case 'playCard':
          playCard(action.cardId);
          break;
        case 'drawCard':
          drawCard();
          break;
        case 'passTurn':
          passTurn();
          break;
        case 'selectWildColor':
          selectWildColor(action.color);
          break;
        case 'declareUno':
          declareUno();
          break;
        default:
          break;
      }
    });
  };

  const createOnlineRoom = (hostName) => {
    return new Promise((resolve, reject) => {
      const socketInst = initSocket();
      socketInst.emit('createRoom', { hostName }, (res) => {
        if (res.success) {
          setIsMultiplayer(true);
          setIsHost(true);
          setRoomCode(res.roomCode);
          setMyPlayerId(res.playerId);
          setLobbyPlayers(res.players);
          setGameStage('setup');
          setupSocketListeners(socketInst);
          resolve(res.roomCode);
        } else {
          setMultiplayerError(res.error || 'Failed to create room.');
          reject(res.error);
        }
      });
    });
  };

  const joinOnlineRoom = (code, playerName) => {
    return new Promise((resolve, reject) => {
      const socketInst = initSocket();
      socketInst.emit('joinRoom', { roomCode: code, playerName }, (res) => {
        if (res.success) {
          setIsMultiplayer(true);
          setIsHost(false);
          setRoomCode(res.roomCode);
          setMyPlayerId(res.playerId);
          setLobbyPlayers(res.players);
          setGameStage('setup');
          setupSocketListeners(socketInst);
          resolve(res.roomCode);
        } else {
          setMultiplayerError(res.error || 'Failed to join room.');
          reject(res.error);
        }
      });
    });
  };

  const leaveOnlineRoom = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
    setIsMultiplayer(false);
    setIsHost(false);
    setRoomCode('');
    setMyPlayerId('');
    setLobbyPlayers(INITIAL_PLAYERS);
    setPlayers([]);
    setGameStage('setup');
  };

  // Broadcast host state to all clients in the room
  useEffect(() => {
    if (isMultiplayer && isHost && socketRef.current) {
      socketRef.current.emit('syncState', {
        roomCode,
        state: {
          gameStage,
          lobbyPlayers,
          players,
          drawPile,
          discardPile,
          currentTurn,
          direction,
          currentColor,
          winner,
          moveHistory,
          showColorPicker,
          pendingWildCard,
          hasDrawnThisTurn,
          drawnCard,
          unoAlert,
          timerValue,
          matchStats
        }
      });
    }
  }, [
    isMultiplayer, isHost, roomCode,
    gameStage, lobbyPlayers, players, drawPile, discardPile,
    currentTurn, direction, currentColor, winner, moveHistory,
    showColorPicker, pendingWildCard, hasDrawnThisTurn, drawnCard,
    unoAlert, timerValue, matchStats
  ]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <GameContext.Provider
      value={{
        // State
        settings,
        gameStage,
        lobbyPlayers,
        players,
        drawPile,
        discardPile,
        currentTurn,
        direction,
        currentColor,
        winner,
        moveHistory,
        showColorPicker,
        pendingWildCard,
        hasDrawnThisTurn,
        drawnCard,
        timerValue,
        matchStats,
        unoAlert,
        roomCode,
        myPlayerId,
        isMultiplayer,
        isHost,
        multiplayerError,
        setMultiplayerError,
        toast,
        
        // Functions
        updateSettings,
        resetSettings,
        addLobbyPlayer,
        removeLobbyPlayer,
        updateLobbyPlayerName,
        startGame,
        drawCard,
        passTurn,
        playCard,
        selectWildColor,
        declareUno,
        playAgain,
        quitToLobby,
        resetGame,
        playSound,
        createOnlineRoom,
        joinOnlineRoom,
        leaveOnlineRoom,
        showToast
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
