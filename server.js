const { createServer } = require('node:http');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const games = new Map();

function validateSecret(secret) {
  if (typeof secret !== "string") return false;
  if (secret.length !== 3) return false;
  if (secret.includes("0")) return false;
  const digits = secret.split("");
  const unique = new Set(digits);
  if (unique.size !== 3) return false;
  return true;
}

function calculateTorosVacas(secret, guess) {
  let toros = 0;
  let vacas = 0;
  for (let i = 0; i < 3; i++) {
    if (guess[i] === secret[i]) {
      toros++;
    } else if (secret.includes(guess[i])) {
      vacas++;
    }
  }
  return { toros, vacas };
}

function generateGameId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  io.on('connection', (socket) => {
    const sessionId = socket.handshake.auth.sessionId;
    if (!sessionId) return socket.disconnect();

    socket.on('create_game', (callback) => {
      const gameId = generateGameId();
      games.set(gameId, {
        id: gameId,
        players: [{ id: sessionId, secret: null, ready: false }],
        status: "waiting",
        turn: Math.random() < 0.5 ? 0 : 1,
        history: [],
        winner: null
      });
      socket.join(gameId);
      callback({ gameId });
    });

    socket.on('join_game', ({ gameId }, callback) => {
      const game = games.get(gameId);
      if (!game) {
        return callback({ error: "Partida no encontrada" });
      }
      
      const isAlreadyIn = game.players.some(p => p.id === sessionId);
      
      if (game.players.length >= 2) {
        if (!isAlreadyIn) return callback({ error: "Partida llena" });
      } else {
        if (!isAlreadyIn) {
          game.players.push({ id: sessionId, secret: null, ready: false });
        }
      }
      
      if (game.players.length === 2 && game.status === "waiting") {
        game.status = "selecting_secret";
      }

      socket.join(gameId);
      broadcastState(gameId);
      callback({ success: true });
    });

    socket.on('submit_secret', ({ gameId, secret }, callback) => {
      const game = games.get(gameId);
      if (!game) return callback({ error: "Error de partida" });
      
      if (!validateSecret(secret)) {
        return callback({ error: "Tres dígitos únicos. El cero no está permitido." });
      }

      const playerIndex = game.players.findIndex(p => p.id === sessionId);
      if (playerIndex === -1) return callback({ error: "No eres jugador" });

      game.players[playerIndex].secret = secret;
      game.players[playerIndex].ready = true;

      if (game.players.length === 2 && game.players[0].ready && game.players[1].ready) {
        game.status = "playing";
        io.to(gameId).emit('notification', { message: "¡Juego iniciado!" });
      } else if (game.players.length === 1 || !game.players.some(p => p.ready)) {
        game.status = "selecting_secret";
      }

      broadcastState(gameId);
      callback({ success: true });
    });

    socket.on('submit_guess', ({ gameId, guess }, callback) => {
      const game = games.get(gameId);
      if (!game || game.status !== "playing") return callback({ error: "No en partida activa" });

      const playerIndex = game.players.findIndex(p => p.id === sessionId);
      if (playerIndex === -1) return callback({ error: "No eres jugador" });

      if (game.turn !== playerIndex) return callback({ error: "No es tu turno" });

      if (!validateSecret(guess)) { 
        return callback({ error: "Intento inválido." });
      }

      const opponentIndex = playerIndex === 0 ? 1 : 0;
      const targetSecret = game.players[opponentIndex].secret;

      const { toros, vacas } = calculateTorosVacas(targetSecret, guess);

      game.history.push({
        playerNumber: playerIndex,
        guess,
        toros,
        vacas
      });

      if (toros === 3) {
        game.status = "finished";
        game.winner = playerIndex;
        io.to(gameId).emit('notification', { message: `¡Fin de la partida!` });
      } else {
        game.turn = opponentIndex;
      }

      broadcastState(gameId);
      callback({ success: true });
    });

    socket.on('rematch', ({ gameId }) => {
      const game = games.get(gameId);
      if (game && game.status === "finished") {
        game.status = "selecting_secret";
        game.history = [];
        game.winner = null;
        game.players.forEach(p => {
          p.secret = null;
          p.ready = false;
        });
        game.turn = Math.random() < 0.5 ? 0 : 1;
        io.to(gameId).emit('notification', { message: "¡Revancha! Ingresa un nuevo número." });
        broadcastState(gameId);
      }
    });

    socket.on('disconnect', () => {
      // With sessions, we don't necessarily delete immediately. 
      // Users can re-join with their session. We only clean rooms if we want timeouts.
      // For MVP, we simply do not drop players on disconnect!
    });
  });

  function broadcastState(gameId) {
    const game = games.get(gameId);
    if (!game) return;

    const sanitizedGame = {
      id: game.id,
      status: game.status,
      turn: game.turn,
      winner: game.winner,
      history: game.history,
      players: game.players.map(p => ({
        id: p.id,
        ready: p.ready,
        secret: game.status === "finished" ? p.secret : null 
      }))
    };

    io.to(gameId).emit('game_state', sanitizedGame);
  }

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
