// src/types.ts

// Ajout de 'POSTAL' dans le flux
export type GameState = 'LOBBY' | 'BIOS' | 'BOOTING' | 'RUNNING' | 'POSTAL' | 'SUCCESS' | 'GAMEOVER';

export interface GameStats {
    budget: number;
    eco: number;
    indep: number;
}

export interface Obstacle {
  id: number;
  x: number;
  type: 'bug' | 'glitch' | 'bloatware';
}