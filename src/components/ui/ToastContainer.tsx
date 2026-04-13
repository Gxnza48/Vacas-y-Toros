"use client";

import { useToastStore } from '@/store/toastStore';
import { AnimatePresence, motion } from 'framer-motion';

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none items-center">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`pointer-events-auto flex items-center justify-between gap-4 px-4 py-3 rounded-2xl shadow-xl backdrop-blur-md bg-white/90 dark:bg-black/90 text-sm font-medium border border-black/5 dark:border-white/10 ${
              toast.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-black dark:text-white'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="opacity-50 hover:opacity-100 transition-opacity"
            >
              &times;
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
