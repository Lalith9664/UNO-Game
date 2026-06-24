import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, BookOpen, Settings, Flame, Sparkles, ArrowLeft, Globe, User, Hash } from 'lucide-react';
import { useUnoGame } from '../hooks/useUnoGame';

export const Home = () => {
  const navigate = useNavigate();
  const { gameStage, playSound, createOnlineRoom, joinOnlineRoom, leaveOnlineRoom } = useUnoGame();

  const [playMode, setPlayMode] = useState('menu'); // 'menu' | 'select' | 'multiplayer'
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('uno_player_name') || '');
  const [targetRoomCode, setTargetRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLandscape, setIsLandscape] = useState(
    typeof window !== 'undefined' ? (window.innerWidth > window.innerHeight && window.innerHeight < 500) : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight && window.innerHeight < 500);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigate = (path) => {
    playSound('click');
    navigate(path);
  };

  const handleLocalPlay = () => {
    playSound('click');
    leaveOnlineRoom();
    navigate('/game');
  };

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setErrorMsg('Please enter your name.');
      playSound('penalty');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    playSound('click');
    try {
      localStorage.setItem('uno_player_name', playerName.trim());
      await createOnlineRoom(playerName.trim());
      navigate('/game');
    } catch (err) {
      setErrorMsg(err || 'Failed to create room.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setErrorMsg('Please enter your name first.');
      playSound('penalty');
      return;
    }
    if (!targetRoomCode.trim()) {
      setErrorMsg('Please enter a room code.');
      playSound('penalty');
      return;
    }
    setErrorMsg('');
    setLoading(true);
    playSound('click');
    try {
      localStorage.setItem('uno_player_name', playerName.trim());
      await joinOnlineRoom(targetRoomCode.toUpperCase().trim(), playerName.trim());
      navigate('/game');
    } catch (err) {
      setErrorMsg(err || 'Failed to join room.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative flex items-center justify-center ${
      isLandscape ? 'h-[calc(100vh-48px)] max-h-[calc(100vh-48px)] overflow-hidden px-2 py-1' : 'min-h-[calc(100vh-68px)] px-4 py-12'
    }`}>
      
      {/* Decorative animated background cards */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[10%] left-[8%] w-24 h-36 bg-gradient-to-br from-red-500 to-red-700 rounded-xl rotate-[-25deg] shadow-lg animate-float hidden md:block" style={{ animationDelay: '0s' }}></div>
        <div className="absolute bottom-[15%] right-[10%] w-24 h-36 bg-gradient-to-br from-blue-500 to-blue-750 rounded-xl rotate-[18deg] shadow-lg animate-float hidden md:block" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-[45%] right-[5%] w-24 h-36 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl rotate-[-12deg] shadow-lg animate-float hidden md:block" style={{ animationDelay: '0.8s' }}></div>
        <div className="absolute bottom-[8%] left-[12%] w-24 h-36 bg-gradient-to-br from-emerald-500 to-green-700 rounded-xl rotate-[30deg] shadow-lg animate-float hidden md:block" style={{ animationDelay: '2.2s' }}></div>
        
        {/* Ambient background glows */}
        <div className="absolute top-[20%] left-[25%] w-96 h-96 rounded-full bg-red-600/10 blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[25%] w-96 h-96 rounded-full bg-blue-600/10 blur-[120px]"></div>
      </div>

      {/* Central Glass Panel */}
      <div className={`relative z-10 glass-panel w-full border border-white/10 shadow-2xl flex flex-col items-center ${
        isLandscape 
          ? 'rounded-xl max-w-xs p-3 max-h-[95vh] overflow-hidden' 
          : 'rounded-3xl max-w-md p-8 md:p-10'
      }`}>
        
        {/* Game Logo */}
        <div className={`relative flex flex-col items-center select-none ${isLandscape ? 'mb-2' : 'mb-8'}`}>
          {!isLandscape && (
            <div className="flex items-center gap-1 text-[10px] font-black tracking-widest text-slate-400 uppercase bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-full mb-3 shadow-inner">
              <Flame className="h-3.5 w-3.5 text-red-500 fill-red-500 animate-pulse" />
              <span>Classic Card Game</span>
            </div>
          )}

          <h1 className={`font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-yellow-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] italic leading-none ${
            isLandscape ? 'text-3xl' : 'text-7xl md:text-8xl'
          }`}>
            UNO
          </h1>
          {!isLandscape && (
            <span className="absolute -bottom-2 right-1 text-xs font-black text-white/95 px-2 py-0.5 rounded-md bg-gradient-to-r from-red-500 to-amber-500 tracking-widest uppercase shadow">
              VITE
            </span>
          )}
        </div>

        {/* Dynamic Screens */}
        {playMode === 'menu' && (
          <div className={`w-full flex flex-col ${isLandscape ? 'gap-2' : 'gap-4'}`}>
            <button
              onClick={() => { playSound('click'); setPlayMode('select'); }}
              className={`group w-full rounded-2xl bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 hover:from-red-650 hover:to-amber-650 text-white font-extrabold tracking-wider uppercase transition-all duration-300 shadow-lg shadow-orange-500/25 hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-3 border border-white/10 ${
                isLandscape ? 'py-2.5 text-sm rounded-xl' : 'py-4.5 text-lg'
              }`}
            >
              <Play className={`fill-white group-hover:scale-110 transition-transform ${isLandscape ? 'h-3.5 w-3.5' : 'h-5 w-5'}`} />
              <span>{gameStage === 'playing' ? 'RESUME GAME' : 'PLAY GAME'}</span>
            </button>

            <button
              onClick={() => handleNavigate('/rules')}
              className={`w-full rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold tracking-wide uppercase transition-all duration-300 border border-white/10 hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-3 ${
                isLandscape ? 'py-2 text-xs rounded-xl' : 'py-4.5 text-base'
              }`}
            >
              <BookOpen className={`text-slate-400 ${isLandscape ? 'h-3.5 w-3.5' : 'h-5 w-5'}`} />
              <span>GAME RULES</span>
            </button>

            <button
              onClick={() => handleNavigate('/settings')}
              className={`w-full rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold tracking-wide uppercase transition-all duration-300 border border-white/10 hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-3 ${
                isLandscape ? 'py-2 text-xs rounded-xl' : 'py-4.5 text-base'
              }`}
            >
              <Settings className={`text-slate-400 ${isLandscape ? 'h-3.5 w-3.5' : 'h-5 w-5'}`} />
              <span>SETTINGS</span>
            </button>
          </div>
        )}

        {playMode === 'select' && (
          <div className={`w-full flex flex-col ${isLandscape ? 'gap-2' : 'gap-4'}`}>
            <h3 className={`text-center font-extrabold text-white tracking-wide uppercase ${isLandscape ? 'text-xs mb-0.5' : 'text-sm mb-2'}`}>Select Play Mode</h3>
            
            <button
              onClick={handleLocalPlay}
              className={`w-full rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-650 hover:from-blue-600 hover:to-indigo-750 text-white font-bold tracking-wide uppercase transition-all duration-300 border border-white/10 hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-3 shadow shadow-blue-500/10 ${
                isLandscape ? 'py-2.5 text-xs rounded-xl' : 'py-4 text-base'
              }`}
            >
              <Play className={`fill-white ${isLandscape ? 'h-3.5 w-3.5' : 'h-5 w-5'}`} />
              <span>Local Pass & Play</span>
            </button>

            <button
              onClick={() => { playSound('click'); setPlayMode('multiplayer'); }}
              className={`w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-650 hover:from-emerald-600 hover:to-teal-750 text-white font-bold tracking-wide uppercase transition-all duration-300 border border-white/10 hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-3 shadow shadow-emerald-500/10 ${
                isLandscape ? 'py-2.5 text-xs rounded-xl' : 'py-4 text-base'
              }`}
            >
              <Globe className={`text-white ${isLandscape ? 'h-3.5 w-3.5' : 'h-5 w-5'}`} />
              <span>Online Rooms</span>
            </button>

            <button
              onClick={() => { playSound('click'); setPlayMode('menu'); }}
              className={`w-full rounded-2xl bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white font-bold tracking-wide uppercase transition-all duration-300 border border-white/10 hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2 ${
                isLandscape ? 'py-2 text-[10px] rounded-xl' : 'py-4 text-sm'
              }`}
            >
              <ArrowLeft className={isLandscape ? 'h-3 w-3' : 'h-4.5 w-4.5'} />
              <span>Back</span>
            </button>
          </div>
        )}

        {playMode === 'multiplayer' && (
          <div className={`w-full flex flex-col ${isLandscape ? 'gap-1.5' : 'gap-4'}`}>
            <h3 className={`text-center font-extrabold text-white tracking-wide uppercase ${isLandscape ? 'text-xs' : 'text-sm'}`}>Multiplayer Rooms</h3>

            {errorMsg && (
              <div className={`w-full rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-center ${isLandscape ? 'p-1.5 text-[9px]' : 'p-3 text-xs'}`}>
                {errorMsg}
              </div>
            )}

            {/* Name Input */}
            <div className="relative w-full">
              <User className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 ${isLandscape ? 'h-3 w-3' : 'h-4 w-4'}`} />
              <input
                type="text"
                placeholder="Enter your name..."
                value={playerName}
                maxLength={16}
                onChange={(e) => setPlayerName(e.target.value)}
                disabled={loading}
                className={`w-full glass-input rounded-xl ${isLandscape ? 'py-1.5 pl-8 pr-3 text-xs' : 'py-3.5 pl-11 pr-4 text-sm rounded-2xl'}`}
              />
            </div>

            {/* Host Section */}
            <button
              onClick={handleCreateRoom}
              disabled={loading}
              className={`w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold tracking-wider uppercase transition-all duration-300 hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2 shadow shadow-orange-500/10 disabled:opacity-50 ${
                isLandscape ? 'py-1.5 text-[10px]' : 'py-3.5 text-sm rounded-2xl'
              }`}
            >
              {loading ? 'Creating...' : 'Create New Room'}
            </button>

            <div className="flex items-center gap-3">
              <span className="h-px bg-white/5 flex-1"></span>
              <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase">Or Join</span>
              <span className="h-px bg-white/5 flex-1"></span>
            </div>

            {/* Join Section */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash className={`absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 ${isLandscape ? 'h-3 w-3' : 'h-4 w-4'}`} />
                <input
                  type="text"
                  placeholder="Room Code"
                  value={targetRoomCode}
                  maxLength={5}
                  onChange={(e) => setTargetRoomCode(e.target.value.toUpperCase())}
                  disabled={loading}
                  className={`w-full glass-input rounded-xl uppercase tracking-widest font-black text-amber-400 placeholder:text-slate-550 ${
                    isLandscape ? 'py-1.5 pl-7 pr-2 text-xs' : 'py-3.5 pl-10 pr-3 text-sm rounded-2xl'
                  }`}
                />
              </div>
              <button
                onClick={handleJoinRoom}
                disabled={loading}
                className={`rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold tracking-wider uppercase transition-all duration-300 hover:scale-[1.02] active:scale-98 disabled:opacity-50 ${
                  isLandscape ? 'py-1.5 px-4 text-[10px]' : 'py-3.5 px-6 text-xs rounded-2xl'
                }`}
              >
                Join
              </button>
            </div>

            <button
              onClick={() => { playSound('click'); setPlayMode('select'); setErrorMsg(''); }}
              disabled={loading}
              className={`w-full rounded-xl bg-white/3 hover:bg-white/5 text-slate-350 hover:text-white font-bold tracking-wide uppercase transition-all duration-300 border border-white/5 flex items-center justify-center gap-2 ${
                isLandscape ? 'py-1 text-[10px]' : 'py-3.5 text-xs rounded-2xl'
              }`}
            >
              <ArrowLeft className={isLandscape ? 'h-3 w-3' : 'h-4 w-4'} />
              <span>Back</span>
            </button>
          </div>
        )}

        {/* Footer info */}
        {!isLandscape && (
          <div className="mt-8 flex items-center gap-1 text-[10px] text-slate-500 font-bold tracking-widest uppercase">
            <Sparkles className="h-3 w-3" />
            <span>Local & Online 2-9 Players</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
