"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGameStore } from '@/store/gameStore';
import { WaitRoom } from '@/components/game/WaitRoom';
import { SelectSecret } from '@/components/game/SelectSecret';
import { PlayBoard } from '@/components/game/PlayBoard';
import { GameOver } from '@/components/game/GameOver';
import { AnimatePresence, motion } from 'framer-motion';

export default function GamePage() {
  const { gameId } = useParams();
  const router = useRouter();
  const { socket, gameState, setGameId } = useGameStore();

  useEffect(() => {
    if (!socket || !gameId) return;
    setGameId(gameId as string);

    // Try to join
    socket.emit('join_game', { gameId }, (res: any) => {
      if (res.error) {
        alert(res.error);
        router.push('/');
      }
    });

    return () => {
      setGameId(null);
    };
  }, [socket, gameId, router, setGameId]);

  if (!gameState) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 flex justify-center items-center">
           <div className="w-6 h-6 border-2 border-black/20 dark:border-white/20 border-t-black dark:border-t-white rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 flex flex-col w-full max-w-lg mx-auto relative px-4 py-6 md:py-12">
      <AnimatePresence mode="wait">
        {gameState.status === 'waiting' && <WaitRoom key="wait" />}
        {gameState.status === 'selecting_secret' && <SelectSecret key="select" />}
        {gameState.status === 'playing' && <PlayBoard key="play" />}
        {gameState.status === 'finished' && <GameOver key="over" />}
      </AnimatePresence>
    </main>
  );
}
