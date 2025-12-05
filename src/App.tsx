import React, { useState } from 'react';
import Lobby from './components/Lobby';
import BiosScreen from './components/BiosScreen';
import BootSequence from './components/BootSequence';
import RunnerGame from './components/RunnerGame';
import SuccessScreen from './components/SuccessScreen';
import { GlitchOverlay } from './components/Effects';
import { audio } from './utils/audio';
import type { GameState, GameStats } from './types';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('LOBBY');
  const [isGlitching, setIsGlitching] = useState(false);
  
  const [gameStats, setGameStats] = useState<GameStats>({ budget: 50, eco: 50, indep: 50 });

  const triggerGlitch = () => {
    setIsGlitching(true);
    audio.playError();
    setTimeout(() => setIsGlitching(false), 300);
  };

  const handleRestart = () => {
    setGameState('LOBBY');
    setIsGlitching(false);
    audio.stopDrone();
  };

  const handleBiosComplete = (finalStats: GameStats) => {
      setGameStats(finalStats);
      setGameState('BOOTING');
  };

  return (
    <div className="font-sans antialiased text-slate-900 bg-slate-950 min-h-screen selection:bg-emerald-500/30">
      <GlitchOverlay active={isGlitching} />

      {gameState === 'LOBBY' && (
        <Lobby 
          onSuccess={() => {
              setGameState('BIOS'); 
              audio.playPowerUp();
          }} 
          triggerGlitch={triggerGlitch} 
          initAudio={() => audio.init()}
        />
      )}

      {/* Ajout de l'étape BIOS */}
      {gameState === 'BIOS' && (
          <BiosScreen onComplete={handleBiosComplete} />
      )}

      {gameState === 'BOOTING' && (
        <BootSequence 
          onComplete={() => {
              setGameState('RUNNING');
              audio.startDrone();
          }} 
        />
      )}

      {gameState === 'RUNNING' && (
        <RunnerGame 
          stats={gameStats}
          onGameOver={() => { 
             audio.playError();
             window.location.reload(); 
          }}
          onSuccess={() => {
              setGameState('SUCCESS');
              audio.stopDrone();
              audio.playSuccess();
          }}
          triggerGlitch={triggerGlitch}
        />
      )}

      {gameState === 'SUCCESS' && (
        <SuccessScreen onRestart={handleRestart} />
      )}
    </div>
  );
}