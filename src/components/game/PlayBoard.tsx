import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useToastStore } from '@/store/toastStore';

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['1','2','3','4','5','6','7','8','9','0'].includes(e.key)) {
        handleKeypad(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Enter') {
        if (guess.length === 3 && !loading) {
          handleSubmit();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [guess, isMyTurn, loading]);

  return (
    <div className="flex flex-col flex-1 w-full pt-2">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Resumen</h2>
        <div className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
          isMyTurn 
            ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' 
            : 'bg-black/10 dark:bg-white/10 text-black/50 dark:text-white/50'
        }`}>
          {isMyTurn ? 'Tu turno' : 'Turno del rival'}
        </div>
      </div>

      {/* History Area — only MY guesses */}
      <div className="overflow-y-auto mb-4 px-1 flex flex-col gap-3" style={{ minHeight: '120px', maxHeight: '40vh' }}>
        {gameState?.history.filter(g => g.playerNumber === playerIndex).length === 0 && (
          <div className="text-center text-black/30 dark:text-white/30 py-8 text-sm">
            Aún no hay intentos. ¡Adivina el número!
          </div>
        )}
        {gameState?.history.filter(g => g.playerNumber === playerIndex).map((g, idx) => {
          return (
            <div 
              key={idx}
              className="flex flex-col items-end"
            >
              <div className="text-xs font-bold uppercase tracking-wider mb-1 opacity-40">
                Intento #{idx + 1}
              </div>
              <div className="flex items-center gap-4 px-5 py-3 rounded-2xl shadow-sm bg-black text-white dark:bg-white dark:text-black rounded-tr-sm">
                <div className="text-3xl font-black tracking-[0.2em] -mr-[0.2em]">
                  {g.guess}
                </div>
                <div className="flex flex-col items-center pl-4 border-l border-current/20">
                  <div className="flex gap-3">
                    <span className="font-bold flex items-center gap-1.5" title="Toros: dígito correcto en posición correcta">
                      <div className="w-2.5 h-2.5 rounded-full bg-current" /> 
                      {g.toros} T
                    </span>
                    <span className="font-bold flex items-center gap-1.5 opacity-60" title="Vacas: dígito correcto en posición incorrecta">
                      <div className="w-2.5 h-2.5 rounded-full border-2 border-current" /> 
                      {g.vacas} V
                    </span>
                  </div>
                </div>
              </div>
            </div>
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
    </div>
  );
}
