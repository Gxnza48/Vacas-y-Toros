import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useToastStore } from '@/store/toastStore';
import { motion, AnimatePresence } from 'framer-motion';

export function PlayBoard() {
  const { socket, gameId, gameState, playerId } = useGameStore();
  const { addToast } = useToastStore();
  const [guess, setGuess] = useState('');
  const [loading, setLoading] = useState(false);
  const endOfHistoryRef = useRef<HTMLDivElement>(null);

  const playerIndex = gameState?.players.findIndex(p => p.id === playerId);
  const isMyTurn = gameState?.turn === playerIndex;

  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState?.history]);

  const handleKeypad = (num: string) => {
    if (!isMyTurn) {
      addToast('No es tu turno', 'error');
      return;
    }
    if (guess.length >= 3) return;
    if (num === '0') {
      addToast('El cero no está permitido', 'error');
      return;
    }
    if (guess.includes(num)) {
      addToast('Dígitos únicos', 'error');
      return;
    }
    setGuess(prev => prev + num);
  };

  const handleBackspace = () => {
    setGuess(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (guess.length !== 3) return;
    if (!socket || !gameId) return;

    setLoading(true);
    socket.emit('submit_guess', { gameId, guess }, (res: any) => {
      setLoading(false);
      if (res.error) {
        addToast(res.error, 'error');
      } else {
        setGuess('');
      }
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full absolute inset-0 pt-6 px-4 pb-[env(safe-area-inset-bottom)]"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Resumen</h2>
        <div className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
          isMyTurn 
            ? 'bg-black text-white dark:bg-white dark:text-black shadow-md scale-105' 
            : 'bg-black/10 dark:bg-white/10 text-black/50 dark:text-white/50'
        }`}>
          {isMyTurn ? 'Tu turno' : 'Turno del rival'}
        </div>
      </div>

      {/* History Area */}
      <div className="flex-1 overflow-y-auto min-h-0 mb-4 px-1 scrollbar-hide flex flex-col gap-3">
        {gameState?.history.map((g, idx) => {
          const isMine = g.playerNumber === playerIndex;
          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: isMine ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
            >
              <div className={`text-xs font-bold uppercase tracking-wider mb-1 opacity-40`}>
                {isMine ? 'Tú' : 'Rival'}
              </div>
              <div className={`flex items-center gap-4 px-5 py-3 rounded-2xl ${
                isMine 
                  ? 'bg-black text-white dark:bg-white dark:text-black rounded-tr-sm' 
                  : 'bg-black/5 dark:bg-white/5 text-black dark:text-white rounded-tl-sm'
              }`}>
                <div className="text-3xl font-black tracking-[0.2em] -mr-[0.2em]">
                  {g.guess}
                </div>
                <div className="flex flex-col items-center pl-4 border-l border-current/20">
                   <div className="flex gap-3">
                     <span className="font-bold flex items-center gap-1.5" title="Toros (Acertaste número y lugar)">
                       <div className="w-2.5 h-2.5 rounded-full bg-current mb-[1px]" /> 
                       {g.toros} T
                     </span>
                     <span className="font-bold flex items-center gap-1.5 opacity-60" title="Vacas (Acertaste número pero no lugar)">
                       <div className="w-2.5 h-2.5 rounded-full border-2 border-current mb-[1px]" /> 
                       {g.vacas} V
                     </span>
                   </div>
                </div>
              </div>
            </motion.div>
          );
        })}
        <div ref={endOfHistoryRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className={`flex-shrink-0 transition-opacity duration-300 ${isMyTurn ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div className="flex justify-center gap-4 mb-6">
          {[0, 1, 2].map((i) => (
            <div 
              key={i}
              className={`w-14 h-16 flex items-center justify-center text-3xl font-black rounded-xl border-2 transition-all ${
                guess[i] 
                  ? 'border-black dark:border-white bg-black/5 dark:bg-white/5 scale-105' 
                  : 'border-black/10 dark:border-white/10'
              }`}
            >
              {guess[i] || '-'}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeypad(num.toString())}
              disabled={guess.includes(num.toString()) || guess.length >= 3}
              className="h-14 sm:h-16 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all text-xl sm:text-2xl font-bold disabled:opacity-30 disabled:active:scale-100"
            >
              {num}
            </button>
          ))}
          <div className="col-span-1" />
          <button
            onClick={handleBackspace}
            className="flex items-center justify-center h-14 sm:h-16 col-span-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all text-lg font-bold"
          >
            Borrar
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={guess.length !== 3 || loading}
          className="w-full h-16 rounded-xl bg-black dark:bg-white text-white dark:text-black text-lg font-bold active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center"
        >
          {loading ? <div className="w-6 h-6 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" /> : 'Adivinar'}
        </button>
      </div>
    </motion.div>
  );
}
