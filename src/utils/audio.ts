// src/utils/audio.ts

// Singleton pour gérer l'AudioContext
class AudioEngine {
    ctx: AudioContext | null = null;
    masterGain: GainNode | null = null;
    oscillator: OscillatorNode | null = null;
  
    init() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3; // Volume global
        this.masterGain.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }
  
    // Petit bip de navigation
    playBlip(freq = 800, type: OscillatorType = 'sine') {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    }
  
    // Son de validation / Succès
    playSuccess() {
      if (!this.ctx) return;
      this.playBlip(600, 'square');
      setTimeout(() => this.playBlip(1200, 'square'), 100);
    }
  
    // Son d'erreur / Glitch
    playError() {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.3);
      
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    }
  
    // Bourdonnement d'ambiance (PC qui tourne)
    startDrone() {
      if (!this.ctx || !this.masterGain || this.oscillator) return;
      this.oscillator = this.ctx.createOscillator();
      const droneGain = this.ctx.createGain();
      
      this.oscillator.type = 'triangle';
      this.oscillator.frequency.value = 55; // Basse fréquence
      
      droneGain.gain.value = 0.05;
      
      this.oscillator.connect(droneGain);
      droneGain.connect(this.masterGain);
      this.oscillator.start();
    }
  
    stopDrone() {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator = null;
      }
    }
    
    // Son d'insertion USB (Power Up)
    playPowerUp() {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2000, this.ctx.currentTime + 1.5);
        
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 1.5);
    }
  }
  
  export const audio = new AudioEngine();