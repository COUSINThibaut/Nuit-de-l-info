// src/types.ts

// On ajoute 'BIOS' ici
export type GameState = 'LOBBY' | 'BIOS' | 'BOOTING' | 'RUNNING' | 'SUCCESS' | 'GAMEOVER';

// La fameuse interface qui manquait
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