/**
 * Computes the index of the next player, taking into account the direction and active player count.
 * 
 * @param {number} currentTurn - Current active player index.
 * @param {string} direction - Game direction ('clockwise' or 'counter-clockwise').
 * @param {number} playerCount - Total number of players.
 * @param {number} skipCount - Number of steps to skip (default 1, meaning next player. 2 means skip next).
 * @returns {number} - The index of the next player.
 */
export const getNextTurn = (currentTurn, direction, playerCount, skipCount = 1) => {
  const step = direction === 'clockwise' ? 1 : -1;
  return (currentTurn + step * skipCount + playerCount * skipCount) % playerCount;
};

/**
 * Calculates the score of a player's hand (sum of card points).
 * 
 * @param {Array} hand - Player's hand of cards.
 * @returns {number} - Total score.
 */
export const calculateHandScore = (hand) => {
  return hand.reduce((sum, card) => sum + (card.score || 0), 0);
};

/**
 * Returns a distinct Tailwind CSS gradient background based on player index
 * @param {number} index 
 * @returns {string} Tailwind gradient class
 */
export const getAvatarGradient = (index) => {
  const gradients = [
    'from-pink-500 to-rose-600',
    'from-violet-500 to-purple-600',
    'from-blue-500 to-indigo-600',
    'from-cyan-500 to-blue-600',
    'from-teal-500 to-emerald-600',
    'from-emerald-500 to-green-600',
    'from-amber-400 to-orange-500',
    'from-orange-500 to-red-600',
    'from-indigo-500 to-purple-600'
  ];
  return gradients[index % gradients.length];
};

/**
 * Extract initials from a name (max 2 characters)
 * @param {string} name 
 * @returns {string} Initials
 */
export const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Sound effects manager using the Web Audio API to synthesize retro card game sounds.
 * This guarantees 100% offline support without external file loading issues!
 */
export const playSynthSound = (type, isMuted) => {
  if (isMuted) return;

  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    switch (type) {
      case 'play': {
        // Soft paper/card placing sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

        osc.start();
        osc.stop(ctx.currentTime + 0.15);
        break;
      }
      case 'draw': {
        // Swish sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

        osc.start();
        osc.stop(ctx.currentTime + 0.2);
        break;
      }
      case 'wild': {
        // Uplifting magic sound
        const now = ctx.currentTime;
        [440, 554, 659, 880].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.05);
          
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.08, now + i * 0.05 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.25);
          
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.25);
        });
        break;
      }
      case 'uno': {
        // Alert sound
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.type = 'sawtooth';
        osc2.type = 'sine';
        
        osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.4);
        osc2.stop(ctx.currentTime + 0.4);
        break;
      }
      case 'penalty': {
        // Downward buzz
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.4);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

        osc.start();
        osc.stop(ctx.currentTime + 0.4);
        break;
      }
      case 'win': {
        // Arpeggio sound
        const now = ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C major arpeggio
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.12, now + i * 0.08 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);

          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.3);
        });
        break;
      }
      case 'click': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

        osc.start();
        osc.stop(ctx.currentTime + 0.05);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error('Audio synthesizer failed:', error);
  }
};
