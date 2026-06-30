const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

// A simple health check or API route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'UNO Multiplayer server is running' });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Rooms database in memory
// roomCode -> { code, hostSocketId, hostPlayerId, players: [{ socketId, playerId, name, isHost, avatarGradient }] }
const rooms = {};

// Helper to generate a unique room code (5 characters)
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'; // Exclude 'O' to avoid confusion with '0'
  let code = '';
  do {
    code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (rooms[code]); // Ensure uniqueness
  return code;
}

// Helper to get color gradients for avatars
const AVATAR_GRADIENTS = [
  'from-red-500 to-rose-600',
  'from-blue-500 to-indigo-600',
  'from-amber-400 to-orange-500',
  'from-emerald-500 to-teal-600',
  'from-purple-500 to-indigo-500',
  'from-pink-500 to-rose-500',
  'from-cyan-400 to-blue-500',
  'from-fuchsia-500 to-purple-600',
  'from-lime-400 to-emerald-500'
];

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // 1. Create Room
  socket.on('createRoom', ({ hostName }, callback) => {
    try {
      const code = generateRoomCode();
      const playerId = `p_host_${Date.now()}`;
      
      rooms[code] = {
        code,
        hostSocketId: socket.id,
        hostPlayerId: playerId,
        players: [
          {
            socketId: socket.id,
            id: playerId, // keep consistent with game structure
            name: hostName || 'Host',
            isHost: true,
            avatarGradient: AVATAR_GRADIENTS[0],
            isBot: false,
            declaredUno: false,
            hand: [],
            stats: { cardsPlayed: 0, turnsTaken: 0 }
          }
        ]
      };

      socket.join(code);
      console.log(`Room created: ${code} by host ${hostName} (${socket.id})`);
      
      callback({
        success: true,
        roomCode: code,
        playerId,
        players: rooms[code].players
      });
    } catch (err) {
      console.error('Error creating room:', err);
      callback({ success: false, error: 'Failed to create room.' });
    }
  });

  // 2. Join Room
  socket.on('joinRoom', ({ roomCode, playerName }, callback) => {
    try {
      const code = roomCode.toUpperCase().trim();
      const room = rooms[code];

      if (!room) {
        return callback({ success: false, error: 'Room not found. Check the code.' });
      }

      if (room.players.length >= 9) {
        return callback({ success: false, error: 'Room is full (max 9 players).' });
      }

      const playerId = `p_join_${Date.now()}`;
      const nextIndex = room.players.length;
      
      const newPlayer = {
        socketId: socket.id,
        id: playerId,
        name: playerName || `Player ${nextIndex + 1}`,
        isHost: false,
        avatarGradient: AVATAR_GRADIENTS[nextIndex % AVATAR_GRADIENTS.length],
        isBot: false,
        declaredUno: false,
        hand: [],
        stats: { cardsPlayed: 0, turnsTaken: 0 }
      };

      room.players.push(newPlayer);
      socket.join(code);

      console.log(`Player ${playerName} joined room ${code}`);

      // Notify host and other players in room
      socket.to(code).emit('playerJoined', { players: room.players, newPlayer });

      callback({
        success: true,
        roomCode: code,
        playerId,
        players: room.players
      });
    } catch (err) {
      console.error('Error joining room:', err);
      callback({ success: false, error: 'Failed to join room.' });
    }
  });

  // 3. Rename Player
  socket.on('renamePlayerInRoom', ({ roomCode, playerId, newName }) => {
    const code = roomCode?.toUpperCase().trim();
    const room = rooms[code];
    if (!room) return;

    const player = room.players.find(p => p.id === playerId);
    if (player) {
      const oldName = player.name;
      player.name = newName;
      console.log(`Renamed in room ${code}: ${oldName} -> ${newName}`);
      
      // Update room players list for all clients
      io.to(code).emit('roomPlayersUpdated', { players: room.players });
      
      // Notify host so the host's authoritative state updates player name
      io.to(room.hostSocketId).emit('hostRequestRename', { playerId, newName });
    }
  });

  // 4. Sync Game State (Host -> Clients)
  socket.on('syncState', ({ roomCode, state }) => {
    const code = roomCode?.toUpperCase().trim();
    if (!rooms[code]) return;
    
    // Broadcast the full game state to all players in the room
    socket.to(code).emit('gameStateSynced', state);
  });

  // 5. Forward Client Action to Host
  socket.on('emitPlayerAction', ({ roomCode, action }) => {
    const code = roomCode?.toUpperCase().trim();
    const room = rooms[code];
    if (!room) return;

    // Send the action to the host for authority processing
    io.to(room.hostSocketId).emit('processPlayerAction', action);
  });

  // 5b. Explicit leave (called before disconnect)
  socket.on('leaveRoom', ({ roomCode }) => {
    const code = roomCode?.toUpperCase().trim();
    const room = rooms[code];
    if (!room) return;

    const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
    if (playerIndex === -1) return;

    const leavingPlayer = room.players[playerIndex];
    room.players.splice(playerIndex, 1);
    socket.leave(code);

    console.log(`Player ${leavingPlayer.name} explicitly left room ${code}`);

    if (room.players.length === 0) {
      delete rooms[code];
      console.log(`Room ${code} closed (empty)`);
      return;
    }

    // If only 1 player left, close the room
    if (room.players.length === 1) {
      const lastPlayer = room.players[0];
      io.to(lastPlayer.socketId).emit('roomClosed', { reason: 'All other players have left the room.' });
      delete rooms[code];
      console.log(`Room ${code} closed (only 1 player remaining)`);
      return;
    }

    // Re-index avatars
    room.players.forEach((p, idx) => {
      p.avatarGradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
    });

    if (leavingPlayer.isHost) {
      const newHost = room.players[0];
      newHost.isHost = true;
      room.hostSocketId = newHost.socketId;
      room.hostPlayerId = newHost.id;
      console.log(`Host left! New host of room ${code} is ${newHost.name}`);
      io.to(code).emit('playerLeft', { playerId: leavingPlayer.id, players: room.players });
      io.to(code).emit('newHostAssigned', { hostPlayerId: newHost.id, players: room.players });
    } else {
      io.to(code).emit('playerLeft', { playerId: leavingPlayer.id, players: room.players });
    }
  });

  // 6. Handle Disconnect / Leave
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
    
    // Check all rooms to remove the disconnected socket
    Object.keys(rooms).forEach((code) => {
      const room = rooms[code];
      const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
      
      if (playerIndex !== -1) {
        const leavingPlayer = room.players[playerIndex];
        room.players.splice(playerIndex, 1);
        
        console.log(`Player ${leavingPlayer.name} disconnected from room ${code}`);

        // If no players left, delete room
        if (room.players.length === 0) {
          delete rooms[code];
          console.log(`Room ${code} closed (empty)`);
          return;
        }

        // If only 1 player left, close the room
        if (room.players.length === 1) {
          const lastPlayer = room.players[0];
          io.to(lastPlayer.socketId).emit('roomClosed', { reason: 'All other players have left the room.' });
          delete rooms[code];
          console.log(`Room ${code} closed (only 1 player remaining after disconnect)`);
          return;
        }

        // Always re-index avatar gradients
        room.players.forEach((p, idx) => {
          p.avatarGradient = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
        });

        // Notify remaining players the player left (removes them from lobby)
        io.to(code).emit('playerLeft', { playerId: leavingPlayer.id, players: room.players });

        // If the host left, assign a new host
        if (leavingPlayer.isHost) {
          const newHost = room.players[0];
          newHost.isHost = true;
          room.hostSocketId = newHost.socketId;
          room.hostPlayerId = newHost.id;
          
          console.log(`Host disconnected! New host of room ${code} is ${newHost.name}`);
          io.to(code).emit('newHostAssigned', { hostPlayerId: newHost.id, players: room.players });
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Multiplayer server running on port ${PORT}`);
});
