import React, { useEffect, useRef, useState } from 'react';
import { Trophy, RotateCcw, Home, Clock, Hash, CheckSquare, Sparkles } from 'lucide-react';

// Hardware-accelerated Canvas Confetti & Party Poppers Component
const ConfettiCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Vibrant party colors
    const colors = [
      '#ff0055', '#00ffcc', '#0099ff', '#ffcc00', '#ff00ff', 
      '#a855f7', '#22c55e', '#ef4444', '#3b82f6', '#f59e0b'
    ];
    
    const particles = [];
    const explosions = [];
    const particleCount = 120;

    // Standard falling confetti particle
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -canvas.height - 20;
        this.size = Math.random() * 8 + 6;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 + 3;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
        this.opacity = 1;
        this.shape = Math.floor(Math.random() * 3); // 0: rect, 1: circle, 2: triangle
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        
        // Add light sway/wind
        this.speedX += Math.sin(this.y / 40) * 0.03;

        // If it falls past the bottom, reset it to top
        if (this.y > canvas.height) {
          this.y = -20;
          this.x = Math.random() * canvas.width;
          this.speedY = Math.random() * 3 + 3;
          this.speedX = Math.random() * 3 - 1.5;
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;

        if (this.shape === 0) {
          // Rectangle confetti
          ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
        } else if (this.shape === 1) {
          // Circle confetti
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 3, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          // Triangle confetti
          ctx.beginPath();
          ctx.moveTo(0, -this.size / 2);
          ctx.lineTo(this.size / 2, this.size / 2);
          ctx.lineTo(-this.size / 2, this.size / 2);
          ctx.closePath();
          ctx.fill();
        }
        
        ctx.restore();
      }
    }

    // Exploding party popper particle from corners
    class ExplodingParticle {
      constructor(side) {
        this.x = side === 'left' ? 0 : canvas.width;
        this.y = canvas.height * 0.85; // shoot from lower third sides
        
        // Angle pointing towards center-up
        const angle = side === 'left' 
          ? (Math.random() * -35 - 15) * Math.PI / 180  // -15 to -50 deg (up and right)
          : (Math.random() * -35 - 130) * Math.PI / 180; // -130 to -165 deg (up and left)
          
        const velocity = Math.random() * 18 + 12;
        this.speedX = Math.cos(angle) * velocity;
        this.speedY = Math.sin(angle) * velocity;
        this.size = Math.random() * 10 + 6;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 8 - 4;
        this.gravity = 0.35;
        this.opacity = 1.0;
        this.decay = Math.random() * 0.012 + 0.008;
        this.shape = Math.floor(Math.random() * 3);
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedY += this.gravity;
        this.rotation += this.rotationSpeed;
        this.opacity -= this.decay;
      }

      draw() {
        if (this.opacity <= 0) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;

        if (this.shape === 0) {
          ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
        } else if (this.shape === 1) {
          ctx.beginPath();
          ctx.arc(0, 0, this.size / 3, 0, 2 * Math.PI);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(0, -this.size / 2);
          ctx.lineTo(this.size / 2, this.size / 2);
          ctx.lineTo(-this.size / 2, this.size / 2);
          ctx.closePath();
          ctx.fill();
        }
        
        ctx.restore();
      }
    }

    // Initialize falling particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Trigger instant party poppers from left/right
    for (let i = 0; i < 90; i++) {
      explosions.push(new ExplodingParticle('left'));
      explosions.push(new ExplodingParticle('right'));
    }

    // Periodic extra explosions every 3 seconds for continuous hype
    const intervalId = setInterval(() => {
      for (let i = 0; i < 25; i++) {
        explosions.push(new ExplodingParticle('left'));
        explosions.push(new ExplodingParticle('right'));
      }
    }, 3000);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw corner explosions
      for (let i = explosions.length - 1; i >= 0; i--) {
        const p = explosions[i];
        p.update();
        p.draw();
        if (p.opacity <= 0 || p.y > canvas.height + 20 || p.x < -20 || p.x > canvas.width + 20) {
          explosions.splice(i, 1);
        }
      }

      // Update and draw continuous rain
      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(intervalId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  );
};

export const WinnerModal = ({
  winner,
  matchStats,
  onPlayAgain,
  onBackToHome
}) => {
  if (!winner) return null;

  const [isLandscape, setIsLandscape] = useState(
    typeof window !== 'undefined' ? (window.innerWidth > window.innerHeight && window.innerHeight < 650) : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight && window.innerHeight < 650);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Confetti party popper canvas */}
      <ConfettiCanvas />

      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md transition-all duration-500"></div>

      {/* Congratulations Modal Card */}
      <div className={`relative glass-panel rounded-3xl w-full border border-white/10 shadow-2xl shadow-black/90 animate-deal-card flex flex-col z-10 ${
        isLandscape 
          ? 'max-w-2xl max-h-[95vh] p-4 overflow-y-auto' 
          : 'max-w-lg max-h-[90vh] overflow-hidden'
      }`}>
        
        {/* Glow effect matching winner avatar color */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[100px] opacity-45 bg-gradient-to-r ${winner.avatarGradient} animate-pulse-slow`}></div>

        {isLandscape ? (
          // Landscape layout: 2 columns
          <div className="relative z-10 flex flex-row gap-4 h-full w-full">
            {/* Left Column: Trophy & Congratulations */}
            <div className="flex-1 flex flex-col items-center justify-center text-center p-2 border-r border-white/5 pr-4">
              <div className={`relative h-12 w-12 rounded-xl bg-gradient-to-tr ${winner.avatarGradient} flex items-center justify-center shadow-lg mb-2 border border-white/20`}>
                <Trophy className="h-6 w-6 text-white" />
                <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-yellow-300 animate-pulse" />
              </div>
              
              <h2 className="text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] uppercase leading-tight">
                CONGRATULATIONS!
              </h2>
              <p className="text-slate-400 font-medium text-[9px] tracking-widest uppercase mt-0.5">
                We have a champion
              </p>

              <div className="relative group mt-2.5">
                <span className={`absolute -inset-0.5 rounded-full bg-gradient-to-r ${winner.avatarGradient} blur-sm opacity-75`}></span>
                <div className="relative px-3.5 py-1 rounded-full border border-white/10 bg-slate-950/90 font-black text-xs text-white shadow-lg flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${winner.avatarGradient}`}></span>
                  <span className={`bg-gradient-to-r ${winner.avatarGradient} bg-clip-text text-transparent font-black`}>
                    {winner.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Stats & Actions */}
            <div className="flex-[1.2] flex flex-col justify-between">
              <div>
                <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                  Match performance report
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="glass-card rounded-xl p-2 flex flex-col gap-0.5 border border-white/5 bg-slate-900/40">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="h-3 w-3 text-cyan-400" />
                      Duration
                    </span>
                    <span className="text-sm font-extrabold text-white">
                      {matchStats.duration}s
                    </span>
                  </div>

                  <div className="glass-card rounded-xl p-2 flex flex-col gap-0.5 border border-white/5 bg-slate-900/40">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Hash className="h-3 w-3 text-purple-400" />
                      Turns
                    </span>
                    <span className="text-sm font-extrabold text-white">
                      {matchStats.totalTurns}
                    </span>
                  </div>

                  <div className="glass-card rounded-xl p-2 flex flex-col gap-0.5 border border-white/5 bg-slate-900/40">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <CheckSquare className="h-3 w-3 text-emerald-400" />
                      Played
                    </span>
                    <span className="text-sm font-extrabold text-white">
                      {winner.stats?.cardsPlayed || 0}
                    </span>
                  </div>

                  <div className="glass-card rounded-xl p-2 flex flex-col gap-0.5 border border-white/5 bg-slate-900/40">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Trophy className="h-3 w-3 text-yellow-400" />
                      Turns Taken
                    </span>
                    <span className="text-sm font-extrabold text-white">
                      {winner.stats?.turnsTaken || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Landscape buttons */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={onPlayAgain}
                  className="flex-1 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-650 hover:to-amber-600 text-white font-extrabold px-3 py-1.5 rounded-lg shadow-lg active:scale-98 transition-all flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Play Again
                </button>
                <button
                  onClick={onBackToHome}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold px-3 py-1.5 rounded-lg active:scale-98 transition-all flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider"
                >
                  <Home className="h-3.5 w-3.5" />
                  Home
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Portrait layout (original)
          <>
            {/* Modal Header & Trophy Hype */}
            <div className="relative pt-10 pb-4 flex flex-col items-center text-center px-6">
              {/* Animated Halo behind Trophy */}
              <div className="absolute top-10 h-24 w-24 rounded-full bg-yellow-500/20 blur-xl animate-ping opacity-60"></div>
              
              <div className={`relative h-24 w-24 rounded-2xl bg-gradient-to-tr ${winner.avatarGradient} flex items-center justify-center shadow-2xl shadow-black/50 mb-5 border border-white/20 scale-105 hover:scale-110 transition-transform duration-300`}>
                <Trophy className="h-12 w-12 text-white animate-bounce-slow" />
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-300 animate-pulse" />
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] uppercase">
                CONGRATULATIONS!
              </h2>
              <p className="text-slate-400 font-medium text-xs sm:text-sm mt-2 tracking-widest uppercase">
                We have a champion
              </p>
            </div>

            {/* Winner Details & Title Showcase */}
            <div className="relative px-8 py-3 flex flex-col items-center">
              <div className="relative group mb-8">
                <span className={`absolute -inset-1 rounded-full bg-gradient-to-r ${winner.avatarGradient} blur-md opacity-75 group-hover:opacity-100 transition duration-300`}></span>
                <div className={`relative px-8 py-3 rounded-full border border-white/10 bg-slate-950/90 font-black text-2xl sm:text-3xl text-white shadow-2xl flex items-center gap-3.5`}>
                  <span className={`w-4 h-4 rounded-full bg-gradient-to-r ${winner.avatarGradient} shadow-md`}></span>
                  <span className={`bg-gradient-to-r ${winner.avatarGradient} bg-clip-text text-transparent font-black`}>
                    {winner.name}
                  </span>
                </div>
              </div>

              {/* Stats Header */}
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3.5 self-start">
                Match performance report
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 w-full mb-2">
                <div className="glass-card rounded-2xl p-4 flex flex-col gap-1 border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-cyan-400" />
                    Duration
                  </span>
                  <span className="text-xl font-extrabold text-white">
                    {matchStats.duration}s
                  </span>
                </div>

                <div className="glass-card rounded-2xl p-4 flex flex-col gap-1 border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Hash className="h-3.5 w-3.5 text-purple-400" />
                    Total Turns
                  </span>
                  <span className="text-xl font-extrabold text-white">
                    {matchStats.totalTurns}
                  </span>
                </div>

                <div className="glass-card rounded-2xl p-4 flex flex-col gap-1 border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
                    Cards Played
                  </span>
                  <span className="text-xl font-extrabold text-white">
                    {winner.stats?.cardsPlayed || 0}
                  </span>
                </div>

                <div className="glass-card rounded-2xl p-4 flex flex-col gap-1 border border-white/5 bg-slate-900/40 hover:bg-slate-900/60 transition-colors">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-yellow-400" />
                    Turns Taken
                  </span>
                  <span className="text-xl font-extrabold text-white">
                    {winner.stats?.turnsTaken || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="relative mt-auto p-6 bg-slate-950/65 border-t border-white/5 flex flex-col sm:flex-row gap-3 z-20">
              <button
                onClick={onPlayAgain}
                className="flex-1 bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-650 hover:to-amber-600 text-white font-extrabold px-6 py-4 rounded-xl shadow-xl shadow-red-500/20 active:scale-98 hover:shadow-red-500/30 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
              >
                <RotateCcw className="h-4.5 w-4.5" />
                Play Again
              </button>
              <button
                onClick={onBackToHome}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold px-6 py-4 rounded-xl active:scale-98 hover:border-white/20 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
              >
                <Home className="h-4.5 w-4.5" />
                Back to Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WinnerModal;
