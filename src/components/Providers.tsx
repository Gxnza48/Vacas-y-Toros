"use client";

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useGameStore } from '@/store/gameStore';
import { useToastStore } from '@/store/toastStore';
import { ToastContainer } from '@/components/ui/ToastContainer';

export function Providers({ children }: { children: React.ReactNode }) {
  const { setSocket, setGameState, setPlayerId } = useGameStore();
  const { addToast } = useToastStore();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    setMounted(true);
    // Dark mode logic
    const preferredTheme = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(preferredTheme as 'light' | 'dark');
    if (preferredTheme === 'dark') document.documentElement.classList.add('dark');

    const socket = io({
      path: '/socket.io',
      autoConnect: true,
    });

    let sid = localStorage.getItem('vacas_session_id');
    if (!sid) {
      sid = Math.random().toString(36).substring(2, 10);
      localStorage.setItem('vacas_session_id', sid);
    }

    // Pass session id in auth or as a query
    socket.auth = { sessionId: sid };

    socket.on('connect', () => {
      setPlayerId(sid!);
    });

    socket.on('game_state', (state) => {
      setGameState(state);
    });

    socket.on('notification', ({ message, type }) => {
      addToast(message, type);
    });

    setSocket(socket);

    return () => {
      socket.disconnect();
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-[100dvh] flex flex-col transition-colors duration-500 bg-white dark:bg-[#0a0a0a] text-black dark:text-white pb-[env(safe-area-inset-bottom)]`}>
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        )}
      </button>
      {children}
      <footer className="mt-auto py-6 text-center text-xs text-black/30 dark:text-white/20 tracking-wide">
        hecho con 💕para trini.
      </footer>
      <ToastContainer />
    </div>
  );
}
