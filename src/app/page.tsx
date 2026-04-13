"use client";

import { useGameStore } from '@/store/gameStore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const socket = useGameStore(state => state.socket);
  const [loading, setLoading] = useState(false);

  const createGame = () => {
    if (!socket || loading) return;
    setLoading(true);
    socket.emit('create_game', ({ gameId }: { gameId: string }) => {
      setLoading(false);
      router.push(`/game/${gameId}`);
    });
  };

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-md w-full"
      >
        <div className="mb-12">
          <h1 className="text-5xl font-black tracking-tight mb-4">
            Vacas <span className="font-light text-black/40 dark:text-white/40">y</span> Toros
          </h1>
          <p className="text-black/60 dark:text-white/60 text-lg font-medium">
            El clásico juego de mente, ahora multijugador.
          </p>
        </div>

        <button
          onClick={createGame}
          disabled={loading || !socket}
          className="group relative w-full flex justify-center items-center gap-3 bg-black dark:bg-white text-white dark:text-black font-semibold text-lg py-4 px-8 rounded-2xl overflow-hidden active:scale-[0.98] transition-all disabled:opacity-50 disabled:active:scale-100 shadow-xl shadow-black/10 dark:shadow-white/10"
        >
          <div className="absolute inset-0 bg-white/20 dark:bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          {loading ? (
            <div className="w-6 h-6 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
          ) : (
            <span className="relative">Crear partida</span>
          )}
        </button>
      </motion.div>
    </main>
  );
}
