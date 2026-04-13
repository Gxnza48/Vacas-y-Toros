import { create } from 'zustand';

export type Player = {
  id: string;
  ready: boolean;
  secret: string | null;
};

export type Guess = {
  playerNumber: number;
  guess: string;
  toros: number;
  vacas: number;
};

export type GameState = {
  id: string;
  status: 'waiting' | 'selecting_secret' | 'playing' | 'finished';
  turn: number;
  winner: number | null;
  history: Guess[];
  players: Player[];
};

interface GameStore {
  socket: any | null;
  setSocket: (socket: any) => void;
  gameState: GameState | null;
  setGameState: (state: GameState) => void;
  gameId: string | null;
  setGameId: (id: string | null) => void;
  playerId: string | null;
  setPlayerId: (id: string) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  socket: null,
  setSocket: (socket) => set({ socket }),
  gameState: null,
  setGameState: (gameState) => set({ gameState }),
  gameId: null,
  setGameId: (gameId) => set({ gameId }),
  playerId: null,
  setPlayerId: (playerId) => set({ playerId }),
}));
