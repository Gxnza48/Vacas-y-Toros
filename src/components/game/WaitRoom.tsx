import { useGameStore } from '@/store/gameStore';
import { useToastStore } from '@/store/toastStore';
import { motion } from 'framer-motion';

export function WaitRoom() {
  const { gameId } = useGameStore();
  const { addToast } = useToastStore();

  const handleCopyLink = () => {
    if (!gameId) return;
    const url = `${window.location.origin}/game/${gameId}`;
    navigator.clipboard.writeText(url).then(() => {
      addToast('Enlace copiado al portapapeles', 'success');
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center flex-1 text-center"
    >
      <div className="w-20 h-20 mb-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center relative">
        <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-8 h-8 text-black/50 dark:text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      </div>
      
      <h2 className="text-3xl font-bold mb-4 tracking-tight">Sala de espera</h2>
      <p className="text-black/60 dark:text-white/60 mb-10 max-w-sm">
        Esta partida requiere dos jugadores. Invita a tu rival para comenzar.
      </p>

      <button
        onClick={handleCopyLink}
        className="group relative flex items-center gap-3 bg-black dark:bg-white text-white dark:text-black hover:bg-black/80 dark:hover:bg-white/80 transition-colors font-medium text-lg py-4 px-8 rounded-2xl w-full active:scale-[0.98]"
      >
        <span className="flex-1 text-center">Invitar jugador</span>
        <svg className="w-5 h-5 opacity-70 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </button>
    </motion.div>
  );
}
