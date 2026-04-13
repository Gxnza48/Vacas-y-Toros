import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useToastStore } from '@/store/toastStore';
import { motion } from 'framer-motion';

export function SelectSecret() {
  const { socket, gameId, gameState, playerId } = useGameStore();
  const { addToast } = useToastStore();
  const [secret, setSecret] = useState('');
  const [loading, setLoading] = useState(false);

  const player = gameState?.players.find(p => p.id === playerId);
  const isReady = player?.ready;

  const handleKeypad = (num: string) => {
    if (secret.length >= 3) return;
    if (num === '0') {
      addToast('El cero no está permitido', 'error');
      return;
    }
    if (secret.includes(num)) {
      addToast('No puedes repetir dígitos', 'error');
      return;
    }
    setSecret(prev => prev + num);
  };

  const handleBackspace = () => {
    setSecret(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (secret.length !== 3) {
      addToast('Debe tener 3 dígitos', 'error');
      return;
    }
    if (!socket || !gameId) return;

    setLoading(true);
    socket.emit('submit_secret', { gameId, secret }, (res: any) => {
      setLoading(false);
      if (res.error) {
        addToast(res.error, 'error');
      } else {
        addToast('Número confirmado', 'success');
      }
    });
  };

  if (isReady) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center flex-1 text-center"
      >
        <div className="w-16 h-16 rounded-full border-2 border-black dark:border-white border-t-transparent animate-spin mb-6" />
        <h2 className="text-2xl font-bold mb-2">Esperando al rival</h2>
        <p className="text-black/60 dark:text-white/60">El juego comenzará en breve.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col flex-1"
    >
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        <h2 className="text-3xl font-bold mb-2">Tu número secreto</h2>
        <p className="text-black/60 dark:text-white/60 mb-10 max-w-xs">
          Elige 3 dígitos únicos del 1 al 9. Tu rival intentará adivinarlo.
        </p>

        <div className="flex gap-4 mb-12">
          {[0, 1, 2].map((i) => (
            <div 
              key={i}
              className={`w-16 h-20 flex items-center justify-center text-4xl font-black rounded-2xl border-2 transition-all ${
                secret[i] 
                  ? 'border-black dark:border-white bg-black/5 dark:bg-white/5 scale-105' 
                  : 'border-black/10 dark:border-white/10'
              }`}
            >
              {secret[i] || '-'}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-auto mb-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleKeypad(num.toString())}
            disabled={secret.includes(num.toString()) || secret.length >= 3}
            className="h-16 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all text-2xl font-bold disabled:opacity-30 disabled:active:scale-100"
          >
            {num}
          </button>
        ))}
        <div className="col-span-1" />
        <button
          onClick={handleBackspace}
          className="col-span-2 h-16 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all text-xl font-bold flex items-center justify-center gap-2"
        >
          Borrar
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={secret.length !== 3 || loading}
        className="w-full h-16 bg-black dark:bg-white text-white dark:text-black rounded-2xl text-xl font-bold disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center"
      >
        {loading ? <div className="w-6 h-6 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" /> : 'Confirmar'}
      </button>
    </motion.div>
  );
}
