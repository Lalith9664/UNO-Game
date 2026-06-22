import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, VolumeX, Moon, Sun, Zap, Clock, Users, RefreshCw, ArrowLeft } from 'lucide-react';
import { useUnoGame } from '../hooks/useUnoGame';

export const Settings = () => {
  const navigate = useNavigate();
  const { settings, updateSettings, resetSettings, playSound } = useUnoGame();

  const handleToggleSound = () => {
    const newVal = !settings.soundOn;
    updateSettings({ soundOn: newVal });
    // Play a click sound if turned on, to give instant feedback
    if (newVal) {
      playSound('click');
    }
  };

  const handleToggleDarkMode = () => {
    updateSettings({ darkMode: !settings.darkMode });
    playSound('click');
  };

  const handleSpeedSelect = (speed) => {
    updateSettings({ animationSpeed: speed });
    playSound('click');
  };

  const handleTimerSelect = (seconds) => {
    updateSettings({ turnTimer: seconds });
    playSound('click');
  };

  const adjustPlayerLimit = (amount) => {
    const current = settings.playerLimit;
    const next = current + amount;
    if (next >= 4 && next <= 9) { // UNO limits
      updateSettings({ playerLimit: next });
      playSound('click');
    }
  };

  const handleReset = () => {
    resetSettings();
    playSound('penalty'); // custom sound feedback
  };

  const handleBack = () => {
    playSound('click');
    navigate(-1); // Back to previous page
  };

  return (
    <div className="min-h-[calc(100vh-68px)] py-12 px-4 flex items-center justify-center">
      <div className="glass-panel rounded-3xl w-full max-w-lg p-6 md:p-8 border border-white/10 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={handleBack}
            className="p-2 rounded-xl bg-white/5 border border-white/5 text-slate-350 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            title="Go Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-wide uppercase">
              Game Settings
            </h2>
            <p className="text-xs text-slate-400">
              Customize your UNO experience
            </p>
          </div>
        </div>

        {/* Options Stack */}
        <div className="flex flex-col gap-6">
          
          {/* Audio Setting */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/3 border border-white/5">
            <div className="flex flex-col">
              <span className="font-bold text-sm text-slate-200">Sound Effects</span>
              <span className="text-[11px] text-slate-500 font-medium">Synthesized game sound FX</span>
            </div>
            <button
              onClick={handleToggleSound}
              className={`p-3 rounded-2xl transition-all duration-300 ${
                settings.soundOn 
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' 
                  : 'bg-red-500/15 border border-red-500/30 text-red-400'
              }`}
            >
              {settings.soundOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
          </div>

          {/* Theme Setting */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/3 border border-white/5">
            <div className="flex flex-col">
              <span className="font-bold text-sm text-slate-200">Dark Mode</span>
              <span className="text-[11px] text-slate-500 font-medium">Toggle dark & light app styling</span>
            </div>
            <button
              onClick={handleToggleDarkMode}
              className={`p-3 rounded-2xl transition-all duration-300 ${
                settings.darkMode 
                  ? 'bg-purple-500/15 border border-purple-500/30 text-purple-400' 
                  : 'bg-amber-400/15 border border-amber-500/30 text-amber-400'
              }`}
            >
              {settings.darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
          </div>

          {/* Turn Timer Selector */}
          <div className="flex flex-col gap-3.5 p-4 rounded-2xl bg-white/3 border border-white/5">
            <div className="flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-slate-400" />
              <span className="font-bold text-sm text-slate-200">Turn Timer Limit</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Off', val: null },
                { label: '10s', val: 10 },
                { label: '15s', val: 15 },
                { label: '30s', val: 30 }
              ].map((t) => (
                <button
                  key={t.label}
                  onClick={() => handleTimerSelect(t.val)}
                  className={`
                    py-2 rounded-xl text-xs font-bold transition-all duration-200 border
                    ${settings.turnTimer === t.val 
                      ? 'bg-gradient-to-r from-red-500 to-amber-500 border-red-500 text-white shadow shadow-red-500/10' 
                      : 'bg-white/5 border-white/5 text-slate-350 hover:text-white hover:bg-white/10'}
                  `}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Animation Speed Setting */}
          <div className="flex flex-col gap-3.5 p-4 rounded-2xl bg-white/3 border border-white/5">
            <div className="flex items-center gap-2">
              <Zap className="h-4.5 w-4.5 text-slate-400" />
              <span className="font-bold text-sm text-slate-200">Card Animation Speed</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['slow', 'normal', 'fast'].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleSpeedSelect(speed)}
                  className={`
                    py-2 rounded-xl text-xs font-bold transition-all duration-200 border capitalize
                    ${settings.animationSpeed === speed 
                      ? 'bg-gradient-to-r from-red-500 to-amber-500 border-red-500 text-white shadow shadow-red-500/10' 
                      : 'bg-white/5 border-white/5 text-slate-350 hover:text-white hover:bg-white/10'}
                  `}
                >
                  {speed}
                </button>
              ))}
            </div>
          </div>

          {/* Player Limit */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/3 border border-white/5">
            <div className="flex items-center gap-2.5">
              <Users className="h-4.5 w-4.5 text-slate-400" />
              <div className="flex flex-col">
                <span className="font-bold text-sm text-slate-200">Max Players Allowed</span>
                <span className="text-[11px] text-slate-500 font-medium">UNO limits lobby sizing (4-9)</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white/5 border border-white/5 px-2.5 py-1.5 rounded-xl">
              <button
                onClick={() => adjustPlayerLimit(-1)}
                disabled={settings.playerLimit <= 4}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 font-bold text-lg flex items-center justify-center text-white disabled:opacity-30 disabled:hover:bg-white/5 transition-colors"
              >
                -
              </button>
              <span className="font-extrabold text-sm text-amber-400 w-4 text-center">
                {settings.playerLimit}
              </span>
              <button
                onClick={() => adjustPlayerLimit(1)}
                disabled={settings.playerLimit >= 9}
                className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 font-bold text-lg flex items-center justify-center text-white disabled:opacity-30 disabled:hover:bg-white/5 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Danger reset settings block */}
        <div className="mt-8 pt-6 border-t border-white/5 flex gap-3">
          <button
            onClick={handleReset}
            className="w-full py-3.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-bold text-xs uppercase tracking-widest transition-all duration-200 border border-red-500/20 flex items-center justify-center gap-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset to Default Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
