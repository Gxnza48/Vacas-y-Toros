import { useGameStore } from '@/store/gameStore';
import { motion } from 'framer-motion';

export function GameOver() {
  const { socket, gameId, gameState, playerId } = useGameStore();

  const playerIndex = gameState?.players.findIndex(p => p.id === playerId);
  const isWinner = gameState?.winner === playerIndex;

  const handleRematch = () => {
    if (!socket || !gameId) return;
    socket.emit('rematch', { gameId });
  };

  const opponentIndex = playerIndex === 0 ? 1 : 0;
  const mySecret = gameState?.players[playerIndex!]?.secret;
  const opponentSecret = gameState?.players[opponentIndex]?.secret;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center flex-1 text-center py-12"
    >
      <div className="mb-12">
        <h2 className="text-6xl font-black mb-4 tracking-tight">
          {isWinner ? '¡Victoria!' : 'Derrota'}
        </h2>
        <p className="text-xl text-black/60 dark:text-white/60">
          {isWinner ? 'Has adivinado el número primero.' : 'Tu rival descubrió tu número.'}
        </p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-6 mb-16">
        <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-6 rounded-2xl">
          <div className="text-left">
             <div className="text-sm font-bold opacity-50 uppercase tracking-widest mb-1">Tu número</div>
             <div className="text-4xl font-black tracking-[0.2em]">{mySecret || '???'}</div>
          </div>
          {isWinner && <div className="text-3xl">🏆</div>}
        </div>

        <div className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-6 rounded-2xl">
          <div className="text-left">
             <div className="text-sm font-bold opacity-50 uppercase tracking-widest mb-1">Rival</div>
             <div className="text-4xl font-black tracking-[0.2em]">{opponentSecret || '???'}</div>
          </div>
          {!isWinner && <div className="text-3xl">🏆</div>}
        </div>
      </div>

      <button
        onClick={handleRematch}
        className="w-full max-w-xs h-16 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-bold text-lg active:scale-95 transition-transform"
      >
        Jugar Revancha
      </button>
    </motion.div>
  );
}
