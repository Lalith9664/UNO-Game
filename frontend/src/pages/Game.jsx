import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  Trash2,
  ShieldAlert,
  RotateCcw,
  Home,
  History,
  HelpCircle,
  Volume2,
  VolumeX,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useUnoGame } from "../hooks/useUnoGame";
import Card from "../components/Card";
import DrawPile from "../components/DrawPile";
import DiscardPile from "../components/DiscardPile";
import PlayerHand from "../components/PlayerHand";
import UNOButton from "../components/UNOButton";
import TurnIndicator from "../components/TurnIndicator";
import WinnerModal from "../components/WinnerModal";
import ColorPickerModal from "../components/ColorPickerModal";
import ShuffleAnimation from "../components/ShuffleAnimation";

export const Game = () => {
  const navigate = useNavigate();
  const {
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
    pendingDrawCount,
    pendingDrawType,

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
    leaveOnlineRoom,
    toast,
    showToast,
  } = useUnoGame();

  // In multiplayer: only the active player can interact
  // In local: always allow (bottom shows current turn's hand)
  const isMyTurn = isMultiplayer
    ? players[currentTurn]?.id === myPlayerId
    : true;

  const [newPlayerName, setNewPlayerName] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showShuffleAnimation, setShowShuffleAnimation] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024,
  );
  const [isLandscapeMobile, setIsLandscapeMobile] = useState(
    typeof window !== "undefined"
      ? window.innerWidth > window.innerHeight && window.innerHeight < 650
      : false,
  );

  const [isFullscreen, setIsFullscreen] = useState(
    typeof document !== "undefined" ? !!document.fullscreenElement : false,
  );

  const handleShuffleComplete = React.useCallback(() => {
    setShowShuffleAnimation(false);
  }, []);

  const toggleFullscreen = () => {
    playSound("click");
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setIsLandscapeMobile(
        window.innerWidth > window.innerHeight && window.innerHeight < 650,
      );
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Automatically request fullscreen on first tap/interaction in mobile landscape mode
  React.useEffect(() => {
    if (!isLandscapeMobile || gameStage !== "playing") return;

    const handleAutoFullscreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.log("Automatic fullscreen request deferred:", err);
        });
      }
      // Remove event listener after first click to avoid spamming calls
      window.removeEventListener("click", handleAutoFullscreen);
    };

    window.addEventListener("click", handleAutoFullscreen);
    return () => window.removeEventListener("click", handleAutoFullscreen);
  }, [isLandscapeMobile, gameStage]);

  // Trigger shuffle animation when transitioning to 'playing' stage
  const prevStageRef = React.useRef(gameStage);
  React.useEffect(() => {
    if (
      (prevStageRef.current === "setup" || prevStageRef.current === "ended") &&
      gameStage === "playing"
    ) {
      setShowShuffleAnimation(true);
    }
    prevStageRef.current = gameStage;
  }, [gameStage]);

  // Block keyboard shortcuts when it's not your turn in multiplayer
  React.useEffect(() => {
    if (gameStage !== "playing" || !isMultiplayer) return;

    const handleKeyDown = (e) => {
      if (!isMyTurn) {
        // Block game-related keyboard shortcuts
        if (["d", "D", "u", "U", "p", "P", " ", "Enter"].includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
          showToast("It's not your turn.");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [gameStage, isMultiplayer, isMyTurn]);

  const handleAddPlayer = (e) => {
    e.preventDefault();
    if (newPlayerName.trim()) {
      addLobbyPlayer(newPlayerName.trim());
      setNewPlayerName("");
    }
  };

  const handleBackToHome = () => {
    playSound("click");
    if (isMultiplayer) {
      leaveOnlineRoom();
    }
    navigate("/");
  };

  const handleLeaveGame = () => {
    playSound("click");
    leaveOnlineRoom();
    navigate("/");
  };

  // Seating arrangement calculations around a circular table
  const renderOpponentsTable = () => {
    const totalPlayers = players.length;
    if (totalPlayers === 0) return null;

    const myIndex = isMultiplayer
      ? players.findIndex((p) => p.id === myPlayerId)
      : -1;
    const activeUserIndex = myIndex !== -1 ? myIndex : 0;

    if (isLandscapeMobile) {
      // Find all players except active user
      const opponents = players.filter((_, idx) => idx !== activeUserIndex);
      return (
        <div className="absolute top-1.5 left-0 right-0 w-full flex items-center justify-center gap-3 z-20 select-none">
          {opponents.map((player) => {
            const isCurrent = players[currentTurn]?.id === player.id;
            return (
              <div
                key={player.id}
                className={`relative flex items-center gap-1.5 border rounded-full px-2 py-0.5 shadow-md transition-all duration-300
                  ${
                    isCurrent
                      ? "border-amber-400 bg-slate-900/95 scale-105 shadow-amber-500/10 ring-2 ring-amber-500/20"
                      : "border-white/5 bg-slate-950/60 opacity-50"
                  }
                `}
              >
                {/* Avatar */}
                <div
                  className={`h-4 w-4 rounded-full bg-gradient-to-br ${player.avatarGradient} flex items-center justify-center text-[7px] font-black text-white`}
                >
                  {player.name.substring(0, 2).toUpperCase()}
                </div>

                {/* Name */}
                <span className="text-[8px] font-bold text-white truncate max-w-[50px]">
                  {player.name}
                </span>

                {/* Cards Count Stack */}
                <div className="flex items-center gap-0.5 bg-black/40 rounded px-1 py-0.25">
                  <div className="w-1.5 h-2.5 bg-gradient-to-br from-red-650 to-red-800 rounded-sm shadow-sm"></div>
                  <span className="text-[7px] font-black text-red-400">
                    {player.hand.length}
                  </span>
                </div>

                {/* UNO badge */}
                {player.hand.length === 1 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white border border-red-400 font-extrabold rounded-full px-1 py-0.25 text-[6px] shadow animate-bounce-slow">
                    UNO
                  </span>
                )}

                {/* Turn status indicator */}
                {isCurrent ? (
                  <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white font-extrabold rounded-full px-1.5 py-0.25 text-[5px] shadow tracking-wider whitespace-nowrap">
                    YOUR TURN
                  </span>
                ) : (
                  <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-slate-700/80 text-slate-400 font-bold rounded-full px-1 py-0.25 text-[4px] shadow tracking-wider whitespace-nowrap">
                    WAITING
                  </span>
                )}
              </div>
            );
          })}
        </div>
      );
    }

    const isMobile = windowWidth < 640;
    const isTablet = windowWidth < 1024;
    const radiusX = isMobile ? 31 : isTablet ? 35 : 38;
    const radiusY = isMobile ? 25 : isTablet ? 30 : 34;

    return players.map((player, i) => {
      const isCurrent = i === currentTurn;

      // Seating math using trigonometry
      // Player 0 at bottom center (90 deg), going clockwise: (90 - i * (360/N))
      const relativeIndex =
        myIndex !== -1 ? (i - myIndex + totalPlayers) % totalPlayers : i;
      const angle = Math.PI / 2 - (relativeIndex * 2 * Math.PI) / totalPlayers;

      // Calculate coordinates (percentage offsets from center)
      const xOffset = 50 + radiusX * Math.cos(angle);
      const yOffset = 50 + radiusY * Math.sin(angle);

      // Card count display details
      const showCardBack = i !== currentTurn;

      return (
        <div
          key={player.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-25 transition-all duration-500"
          style={{ left: `${xOffset}%`, top: `${yOffset}%` }}
        >
          {/* Active Turn Highlight Circle */}
          <div className="relative group">
            {isCurrent && (
              <span className="absolute -inset-1.5 sm:-inset-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-500 to-amber-500 blur-md opacity-75 animate-pulse"></span>
            )}

            <div
              className={`
              relative border glass-panel transition-all duration-300 flex flex-col items-center
              w-20 sm:w-24 p-1.5 sm:p-2.5 rounded-xl sm:rounded-2xl gap-1 sm:gap-1.5
              ${isCurrent ? "border-amber-400 bg-slate-900/90 scale-105" : "border-white/5 bg-slate-950/60 opacity-50"}
            `}
            >
              {/* Initials Avatar */}
              <div
                className={`
                bg-gradient-to-br ${player.avatarGradient} flex items-center justify-center font-extrabold text-white shadow-md border border-white/10
                h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl text-xs sm:text-sm
              `}
              >
                {player.name.substring(0, 2).toUpperCase()}
              </div>

              {/* Player Name */}
              <div className="text-center w-full">
                <p className="font-black text-white truncate max-w-full text-[9px] sm:text-[10px]">
                  {player.name}
                </p>

                {/* Card count tag */}
                <p className="font-bold text-slate-400 mt-0.5 text-[8px] sm:text-[9px]">
                  {player.hand.length}{" "}
                  {player.hand.length === 1 ? "card" : "cards"}
                </p>
              </div>

              {/* UNO badge indicator */}
              {player.hand.length === 1 && (
                <span className="bg-red-500 text-white border border-red-400 font-extrabold rounded-full shadow animate-bounce-slow -top-1.5 -right-1.5 text-[8px] px-1.5 py-0.5">
                  UNO
                </span>
              )}

              {/* Turn status badge */}
              {isCurrent ? (
                <span className="bg-emerald-500 text-white font-extrabold rounded-full px-2 py-0.5 text-[7px] sm:text-[8px] shadow tracking-wider animate-pulse-slow">
                  YOUR TURN
                </span>
              ) : (
                <span className="bg-slate-700/60 text-slate-400 font-bold rounded-full px-1.5 py-0.5 text-[6px] sm:text-[7px] shadow tracking-wider">
                  WAITING
                </span>
              )}
            </div>
          </div>

          {/* Miniature card back stack to visualize cards in hand */}
          <div className="flex gap-0.5 justify-center overflow-hidden px-1 mt-2 h-7 sm:h-9 max-w-[80px] sm:max-w-xs">
            {player.hand.map((card, cIndex) => (
              <div
                key={card.id}
                className="border border-white/15 bg-gradient-to-br from-red-750 to-red-950 rounded-sm card-shadow flex-shrink-0 w-3 h-4.5 sm:w-4 sm:h-6"
                style={{
                  transform: `rotate(${(cIndex - (player.hand.length - 1) / 2) * 5}deg) translateY(${Math.abs(cIndex - (player.hand.length - 1) / 2) * 1}px)`,
                  marginLeft:
                    cIndex > 0 ? (isMobile ? "-8px" : "-10px") : "0px",
                }}
              ></div>
            ))}
          </div>
        </div>
      );
    });
  };

  return (
    <div
      className={`min-h-screen relative flex flex-col ${gameStage === "playing" || gameStage === "ended" || (gameStage === "setup" && isLandscapeMobile) ? "overflow-hidden" : "overflow-y-auto"}`}
    >
      {/* UNO LOBBY / SETUP SCREEN */}
      {gameStage === "setup" && (
        <div
          className={`flex-1 flex items-center justify-center relative ${
            isLandscapeMobile
              ? "p-1 h-screen max-h-screen overflow-hidden"
              : "p-2 sm:p-4 py-2 sm:py-8"
          }`}
        >
          <div
            className={`glass-panel w-full border border-white/10 shadow-2xl flex flex-col relative overflow-hidden ${
              isLandscapeMobile
                ? "rounded-xl max-w-sm p-2 gap-1 max-h-[calc(100vh-16px)]"
                : "rounded-[20px] sm:rounded-3xl max-w-2xl p-3 sm:p-6 md:p-10 gap-3 sm:gap-8"
            }`}
          >
            {/* Background blobs */}
            <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-red-500/10 blur-[80px] pointer-events-none"></div>
            <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-amber-500/10 blur-[80px] pointer-events-none"></div>

            {/* Title — hidden in landscape to save space */}
            {!isLandscapeMobile && (
              <div className="text-center flex flex-col items-center">
                <h2 className="font-black text-white tracking-wide uppercase flex items-center gap-2 text-xl sm:text-3xl">
                  <Users className="text-red-500 animate-pulse h-5 w-5 sm:h-7 sm:w-7" />
                  <span>Player Setup Lobby</span>
                </h2>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">
                  Configure names and add players (2 to {settings.playerLimit}{" "}
                  players)
                </p>
              </div>
            )}

            {isMultiplayer ? (
              <div
                className={`flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 shadow-inner ${
                  isLandscapeMobile
                    ? "flex-row gap-2 p-2 rounded-xl"
                    : "flex-col sm:flex-row gap-4 p-4.5"
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <span
                    className={`text-slate-400 font-bold uppercase tracking-wider ${isLandscapeMobile ? "text-[8px]" : "text-xs"}`}
                  >
                    Room Code
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 tracking-widest ${isLandscapeMobile ? "text-base" : "text-2xl"}`}
                    >
                      {roomCode}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(roomCode);
                        playSound("click");
                      }}
                      className={`bg-white/5 hover:bg-white/10 text-slate-355 hover:text-white px-2 py-0.5 rounded-md border border-white/5 font-extrabold uppercase transition-all ${isLandscapeMobile ? "text-[7px]" : "text-[10px]"}`}
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div
                  className={`text-right text-slate-500 font-medium ${isLandscapeMobile ? "text-[8px]" : "text-xs"}`}
                >
                  {isHost ? (
                    <span className="text-emerald-400 font-bold">
                      You are the HOST.
                    </span>
                  ) : (
                    <span className="text-amber-400 font-bold">
                      Waiting for host...
                    </span>
                  )}
                </div>
              </div>
            ) : (
              /* Add Player Input */
              <form onSubmit={handleAddPlayer} className="flex gap-2 sm:gap-3">
                <input
                  type="text"
                  placeholder="Enter player name..."
                  value={newPlayerName}
                  maxLength={16}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  className={`flex-1 glass-input ${
                    isLandscapeMobile
                      ? "py-0.5 px-2 rounded-lg text-[10px]"
                      : "py-1.5 px-3 sm:py-3 sm:px-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm"
                  }`}
                />
                <button
                  type="submit"
                  disabled={lobbyPlayers.length >= settings.playerLimit}
                  className={`bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-650 hover:to-amber-650 text-white font-extrabold shadow-md disabled:opacity-30 transition-all flex items-center gap-1.5 uppercase tracking-wider shrink-0 ${
                    isLandscapeMobile
                      ? "text-[8px] px-2 py-0.5 rounded-lg"
                      : "text-[10px] sm:text-xs px-3 py-1.5 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl"
                  }`}
                >
                  <UserPlus
                    className={
                      isLandscapeMobile
                        ? "h-3 w-3"
                        : "h-3.5 w-3.5 sm:h-4 sm:w-4"
                    }
                  />
                  <span>Add</span>
                </button>
              </form>
            )}

            <div
              className={`flex flex-col ${
                isLandscapeMobile
                  ? "gap-0.5"
                  : "gap-2 sm:gap-3.5 max-h-[35vh] overflow-y-auto pr-1 custom-scrollbar"
              }`}
            >
              {lobbyPlayers.map((player, idx) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between bg-white/3 border border-white/5 shadow-inner gap-1 ${
                    isLandscapeMobile
                      ? "p-0.5 rounded-md"
                      : "p-2.5 sm:p-3 rounded-xl sm:rounded-2xl gap-2"
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div
                      className={`rounded-md bg-gradient-to-br ${player.avatarGradient} flex items-center justify-center text-white font-extrabold shadow-inner shrink-0 ${
                        isLandscapeMobile
                          ? "h-4 w-4 text-[7px]"
                          : "h-7 w-7 sm:h-8 sm:w-8 text-xs"
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <input
                      type="text"
                      value={player.name}
                      maxLength={16}
                      disabled={isMultiplayer && player.id !== myPlayerId}
                      onChange={(e) =>
                        updateLobbyPlayerName(player.id, e.target.value)
                      }
                      className={`bg-transparent border-b border-transparent focus:border-white/20 px-1 text-white font-bold outline-none w-full min-w-0 flex-1 ${
                        isLandscapeMobile
                          ? "text-[9px] py-0"
                          : "text-xs sm:text-sm py-0.5"
                      } ${isMultiplayer && player.id !== myPlayerId ? "cursor-default" : "cursor-text"}`}
                    />
                  </div>

                  {!isMultiplayer && lobbyPlayers.length > 2 && (
                    <button
                      onClick={() => removeLobbyPlayer(player.id)}
                      className="p-0.5 text-slate-450 hover:text-red-400 hover:bg-red-500/10 rounded transition-all shrink-0"
                      title="Remove Player"
                    >
                      <Trash2
                        className={
                          isLandscapeMobile ? "h-2.5 w-2.5" : "h-4 w-4"
                        }
                      />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Lobby Footer Details */}
            <div
              className={`flex border-t border-white/5 ${
                isLandscapeMobile
                  ? "flex-row gap-1.5 pt-1 mt-0"
                  : "flex-col sm:flex-row gap-3 sm:gap-4 pt-6 mt-2"
              }`}
            >
              <button
                onClick={handleBackToHome}
                className={`flex-1 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold tracking-wide uppercase transition-all duration-300 border border-white/10 flex items-center justify-center gap-1 ${
                  isLandscapeMobile
                    ? "py-1.5 text-[9px] rounded-lg"
                    : "py-2.5 sm:py-4 sm:rounded-2xl text-xs sm:text-sm"
                }`}
              >
                <Home className={isLandscapeMobile ? "h-3 w-3" : "h-4 w-4"} />
                Home
              </button>

              <button
                onClick={() => {
                  startGame();
                  setShowShuffleAnimation(true);
                }}
                disabled={lobbyPlayers.length < 2 || (isMultiplayer && !isHost)}
                className={`flex-grow-[2] rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-extrabold tracking-wider uppercase transition-all duration-300 shadow-lg shadow-emerald-500/15 flex items-center justify-center gap-1 border border-white/10 disabled:opacity-30 ${
                  isLandscapeMobile
                    ? "py-1.5 text-[9px] rounded-lg"
                    : "py-2.5 sm:py-4 sm:rounded-2xl text-xs sm:text-sm"
                }`}
              >
                <RotateCcw
                  className={`fill-white ${isLandscapeMobile ? "h-3 w-3" : "h-4 w-4"}`}
                />
                <span>
                  {isMultiplayer && !isHost ? "Waiting..." : "Start Match"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CARD SHUFFLE ANIMATION */}
      {showShuffleAnimation && (
        <ShuffleAnimation
          playerCount={lobbyPlayers.length}
          onComplete={handleShuffleComplete}
        />
      )}

      {/* ACTIVE UNO GAME BOARD SCREEN */}
      {(gameStage === "playing" || gameStage === "ended") && (
        <div
          className={`flex-1 flex flex-col justify-between relative ${
            isLandscapeMobile
              ? "p-1 h-screen max-h-screen overflow-hidden"
              : "p-2 sm:p-4 min-h-screen"
          }`}
        >
          {/* Header Dashboard panel */}
          <div
            className={`w-full flex items-center justify-between z-30 gap-2 ${isLandscapeMobile ? "mb-0" : "mb-1 sm:mb-2"}`}
          >
            {/* Quick stats / Turn info */}
            <div className="flex items-center gap-3">
              <TurnIndicator
                activePlayerName={players[currentTurn]?.name || ""}
                direction={direction}
                currentColor={currentColor}
                timerValue={timerValue}
                maxTimerValue={settings.turnTimer}
                totalPlayers={players.length}
                isLandscapeMobile={isLandscapeMobile}
              />
            </div>

            {/* Sidebar toggle and game control buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Fullscreen toggle button */}
              <button
                onClick={toggleFullscreen}
                className={`${isLandscapeMobile ? "p-1.5" : "p-2.5 sm:p-3"} rounded-xl sm:rounded-2xl border transition-all glass-panel border-white/5 text-slate-300 hover:text-white hover:bg-white/5`}
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
              >
                {isFullscreen ? (
                  <Minimize2
                    className={`${isLandscapeMobile ? "h-3.5 w-3.5" : "h-4 w-4 sm:h-5 sm:w-5"}`}
                  />
                ) : (
                  <Maximize2
                    className={`${isLandscapeMobile ? "h-3.5 w-3.5" : "h-4 w-4 sm:h-5 sm:w-5"}`}
                  />
                )}
              </button>

              {/* Event Logs toggle button */}
              <button
                onClick={() => {
                  playSound("click");
                  setShowHistory(!showHistory);
                }}
                className={`${isLandscapeMobile ? "p-1.5" : "p-2.5 sm:p-3"} rounded-xl sm:rounded-2xl border transition-all ${
                  showHistory
                    ? "bg-amber-500/15 border-amber-500/35 text-amber-400"
                    : "glass-panel border-white/5 text-slate-300 hover:text-white hover:bg-white/5"
                }`}
                title="Move History"
              >
                <History
                  className={`${isLandscapeMobile ? "h-3.5 w-3.5" : "h-4 w-4 sm:h-5 sm:w-5"}`}
                />
              </button>

              {/* Quit / Leave Game button */}
              <button
                onClick={
                  isMultiplayer && !isHost ? handleLeaveGame : quitToLobby
                }
                className={`glass-panel border-white/5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl sm:rounded-2xl font-black uppercase tracking-wider transition-all ${
                  isLandscapeMobile
                    ? "px-2 py-1 text-[8px]"
                    : "px-2.5 py-1.5 sm:px-4 sm:py-3 text-[10px] sm:text-xs"
                }`}
              >
                {isMultiplayer && !isHost ? "Leave Room" : "Quit Game"}
              </button>
            </div>
          </div>

          {/* Central Circular Game Table */}
          <div
            className={`flex-1 w-full mx-auto relative glass-panel-light border border-white/5 shadow-2xl flex items-center justify-center overflow-hidden ${
              isLandscapeMobile
                ? "max-w-[98vw] my-0 rounded-xl"
                : "max-w-[95vw] md:max-w-6xl my-2 sm:my-6 min-h-[220px] sm:min-h-[360px] rounded-2xl sm:rounded-[48px]"
            }`}
          >
            {/* Table center label/visuals */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.85)_0%,rgba(2,6,23,0.95)_100%)] z-0"></div>

            {/* Ring loop visual */}
            <div className="absolute w-[80%] h-[75%] border border-dashed border-white/5 rounded-[100%] z-0 pointer-events-none"></div>

            {/* Circular Seating of all Players */}
            {renderOpponentsTable()}

            {/* Table Center: Draw Pile & Discard Pile */}
            <div className="relative z-30 flex items-center gap-4 sm:gap-8 md:gap-12 justify-center">
              {/* Draw Pile stack */}
              <DrawPile
                cardCount={drawPile.length}
                canDraw={
                  gameStage === "playing" &&
                  isMyTurn &&
                  !hasDrawnThisTurn &&
                  !showColorPicker
                }
                onDraw={drawCard}
                size={isLandscapeMobile ? "xs" : "md"}
                pendingDrawCount={pendingDrawCount}
              />

              {/* Discard Pile Stack */}
              <DiscardPile
                discardPile={discardPile}
                currentColor={currentColor}
                size={isLandscapeMobile ? "xs" : "md"}
              />
            </div>

            {/* Draw Decision Helper banner when player drew playable card */}
            {isMyTurn && hasDrawnThisTurn && drawnCard && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-35 bg-slate-900/95 backdrop-blur border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-4 shadow-2xl shadow-black/80">
                <span className="text-xs text-slate-300 font-semibold">
                  Drew playable card:
                </span>

                {/* Instant Play option */}
                <div className="flex gap-2">
                  <button
                    onClick={() => playCard(drawnCard.id)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-[10px] px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-colors"
                  >
                    Play Card
                  </button>
                  <button
                    onClick={passTurn}
                    className="bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-[10px] px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-colors"
                  >
                    Keep / Pass
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Row: Active Player Cards hand and UNO call triggers */}
          <div
            className={`w-full flex flex-col items-center z-30 ${isLandscapeMobile ? "gap-0" : "gap-1 sm:gap-4"}`}
          >
            {/* UNO declarer alarms */}
            <UNOButton
              isCurrentTurn={isMyTurn}
              handSize={
                isMultiplayer
                  ? players.find((p) => p.id === myPlayerId)?.hand?.length || 0
                  : players[currentTurn]?.hand?.length || 0
              }
              hasDeclaredUno={
                isMultiplayer
                  ? players.find((p) => p.id === myPlayerId)?.declaredUno ||
                    false
                  : players[currentTurn]?.declaredUno || false
              }
              onDeclare={declareUno}
            />

            {/* Current Active Player Cards hand */}
            <PlayerHand
              hand={
                isMultiplayer
                  ? players.find((p) => p.id === myPlayerId)?.hand || []
                  : players[currentTurn]?.hand || []
              }
              onPlayCard={playCard}
              isCurrentTurn={isMyTurn}
              topCard={discardPile[discardPile.length - 1]}
              currentColor={currentColor}
              playerName={
                isMultiplayer
                  ? players.find((p) => p.id === myPlayerId)?.name || ""
                  : players[currentTurn]?.name || ""
              }
              onRename={
                isMultiplayer
                  ? (newName) => updateLobbyPlayerName(myPlayerId, newName)
                  : (newName) =>
                      updateLobbyPlayerName(players[currentTurn]?.id, newName)
              }
              cardSize={isLandscapeMobile ? "xs" : "md"}
              isLandscapeMobile={isLandscapeMobile}
              pendingDrawCount={pendingDrawCount}
              pendingDrawType={pendingDrawType}
              gameStage={gameStage}
            />
          </div>

          {/* Floating logs history panel drawer (Right side overlay) */}
          <div
            className={`
            fixed top-0 right-0 bottom-0 z-40 w-80 glass-panel border-l border-white/10 shadow-2xl p-4 flex flex-col gap-4 transition-transform duration-300
            ${showHistory ? "translate-x-0" : "translate-x-full"}
          `}
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h4 className="font-extrabold text-sm text-white tracking-wider uppercase flex items-center gap-1.5">
                <History className="h-4 w-4 text-amber-400" />
                Move Log
              </h4>
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-2.5">
              {moveHistory.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-550 text-xs font-semibold">
                  No moves logged yet.
                </div>
              ) : (
                moveHistory.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-white/2 border border-white/5 flex flex-col gap-1 shadow-inner"
                  >
                    <span className="text-[10px] text-slate-450 font-bold self-end leading-none">
                      {log.timestamp}
                    </span>
                    <p className="text-xs text-slate-200 leading-normal font-normal">
                      {log.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* UNO Alert overlay notifications */}
          {unoAlert && (
            <div className="fixed top-1/3 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white font-black tracking-widest text-center border-4 border-amber-400 rounded-3xl p-6 shadow-2xl shadow-black/80 animate-bounce-slow text-2xl rotate-[-5deg]">
              <ShieldAlert className="h-10 w-10 mx-auto mb-2 text-white animate-pulse" />
              <p className="uppercase">{unoAlert.playerName}!</p>
              <p className="text-sm font-bold text-amber-200 mt-1 uppercase tracking-wide">
                {unoAlert.message}
              </p>
            </div>
          )}

          {/* Toast Notification */}
          {toast && (
            <div
              className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] animate-fade-in-up pointer-events-none`}
            >
              <div
                className={`px-6 py-3 rounded-2xl font-bold text-sm tracking-wide shadow-2xl shadow-black/60 border backdrop-blur-xl flex items-center gap-2
                ${
                  toast.type === "error"
                    ? "bg-red-950/90 border-red-500/30 text-red-300"
                    : "bg-slate-900/90 border-white/10 text-slate-200"
                }
              `}
              >
                {toast.type === "error" && (
                  <ShieldAlert className="h-4 w-4 text-red-400 flex-shrink-0" />
                )}
                {toast.message}
              </div>
            </div>
          )}

          {/* Color picking dropdown overlay modal */}
          <ColorPickerModal
            isOpen={showColorPicker && isMyTurn}
            playerName={players[currentTurn]?.name || ""}
            isWildDrawFour={pendingWildCard?.value === "wild4"}
            onSelectColor={selectWildColor}
          />

          {/* Winner details stats report modal */}
          <WinnerModal
            winner={winner}
            matchStats={matchStats}
            onPlayAgain={playAgain}
            onBackToHome={handleBackToHome}
          />
        </div>
      )}

      {/* Mobile Portrait Orientation Lock Overlay — only during active gameplay */}
      {(gameStage === "playing" || gameStage === "ended") && (
        <div className="hidden md:portrait:hidden portrait:flex fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-xl flex-col items-center justify-center p-6 text-center">
          <div className="glass-panel max-w-xs p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-6">
            {/* Animated phone rotation icon */}
            <div className="relative w-16 h-24 border-4 border-slate-400 rounded-2xl flex items-center justify-center animate-rotate-device">
              {/* Phone screen details */}
              <div className="w-1.5 h-1.5 bg-slate-400 rounded-full absolute bottom-1.5"></div>
              <div className="w-8 h-1 bg-slate-400 rounded absolute top-2"></div>

              {/* Rotation arrow */}
              <div
                className="absolute -inset-4 border-2 border-dashed border-amber-400 rounded-full animate-spin"
                style={{ animationDuration: "8s" }}
              ></div>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-black text-white tracking-wide uppercase">
                Tilt Your Screen
              </h3>
              <p className="text-xs text-slate-405 leading-relaxed">
                Please rotate your device to landscape mode to play.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Landscape Fullscreen Prompt Overlay — only during active gameplay */}
      {isLandscapeMobile &&
        !isFullscreen &&
        (gameStage === "playing" || gameStage === "ended") && (
          <div
            onClick={toggleFullscreen}
            className="fixed inset-0 z-[10000] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer select-none"
          >
            <div className="glass-panel max-w-xs p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-6 hover:scale-[1.02] transition-all duration-300">
              <div className="relative w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                <Maximize2 className="h-8 w-8 text-white animate-pulse" />
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-black text-white tracking-wide uppercase">
                  Immersive Mode
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tap anywhere to occupy the entire screen and play.
                </p>
              </div>

              <button className="bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl uppercase tracking-wider border border-white/10 transition-all shadow-md shadow-orange-500/15">
                Start Fullscreen
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default Game;
