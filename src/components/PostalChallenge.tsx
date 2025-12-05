import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { audio } from '../utils/audio';

interface PostalChallengeProps {
    onComplete: () => void;
}

export default function PostalChallenge({ onComplete }: PostalChallengeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>();
    
    const lastTimeRef = useRef<number>(0); 

    const gameState = useRef({
        ball: { y: 500, vy: 0, radius: 20 },
        fanSpeed: 0,
        isButtonDown: false,
        particles: [] as { x: number, y: number, vy: number, size: number }[],
        validationTimer: 0,
        currentZoneIndex: -1
    });

    const [postalCode, setPostalCode] = useState<number[]>([]);
    const [statusMessage, setStatusMessage] = useState("EN ATTENTE...");

    const TOTAL_DIGITS = 5;
    const GRAVITY = 0.4;
    const FAN_POWER_BASE = 0.85; 
    const FAN_ACCELERATION = 0.05;
    const FAN_DECAY = 0.03;
    const AIR_RESISTANCE = 0.98; 
    const BOUNCE = -0.6;
    const TICKS_TO_VALIDATE = 100;

    const startBlow = useCallback(() => { gameState.current.isButtonDown = true; }, []);
    const stopBlow = useCallback(() => { gameState.current.isButtonDown = false; }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { if (e.code === 'Space') startBlow(); };
        const handleKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space') stopBlow(); };
        
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [startBlow, stopBlow]);

    const loop = useCallback((time: number) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) {
            requestRef.current = requestAnimationFrame(loop);
            return;
        }

        // --- DÉBUT CORRECTION DELTA TIME ---
        if (lastTimeRef.current === 0) {
            lastTimeRef.current = time;
            requestRef.current = requestAnimationFrame(loop);
            return;
        }

        const deltaTime = (time - lastTimeRef.current) / 1000;
        lastTimeRef.current = time;

        if (deltaTime > 0.1) {
            requestRef.current = requestAnimationFrame(loop);
            return;
        }

        const timeFactor = deltaTime * 60;


        const state = gameState.current;
        const width = canvas.width;
        const height = canvas.height;
        const zoneHeight = height / 10;

        if (state.isButtonDown) {
            if (state.fanSpeed < 1.0) state.fanSpeed += FAN_ACCELERATION * timeFactor;
        } else {
            if (state.fanSpeed > 0) state.fanSpeed -= FAN_DECAY * timeFactor;
        }
        if (state.fanSpeed < 0) state.fanSpeed = 0;

        let upwardForce = -FAN_POWER_BASE * state.fanSpeed * timeFactor;
        if (state.fanSpeed > 0.5) upwardForce += (Math.random() - 0.5) * 0.3 * timeFactor;

        state.ball.vy += GRAVITY * timeFactor;
        state.ball.vy += upwardForce;
        state.ball.vy *= AIR_RESISTANCE;

        state.ball.y += state.ball.vy;

        if (state.ball.y > height - state.ball.radius) {
            state.ball.y = height - state.ball.radius;
            state.ball.vy *= BOUNCE;
            if (Math.abs(state.ball.vy) < 0.5) state.ball.vy = 0;
        }
        if (state.ball.y < state.ball.radius) {
            state.ball.y = state.ball.radius;
            state.ball.vy *= BOUNCE;
            if (Math.abs(state.ball.vy) < 0.5) state.ball.vy = 0;
        }

        let rawIndex = Math.floor(state.ball.y / zoneHeight);
        let digit = 9 - rawIndex;
        if (digit < 0) digit = 0; if (digit > 9) digit = 9;

        if (postalCode.length < TOTAL_DIGITS) {
            if (digit === state.currentZoneIndex) {
                state.validationTimer += timeFactor;
                if (state.validationTimer >= TICKS_TO_VALIDATE) {
                    setPostalCode(prev => {
                        const newCode = [...prev, digit];
                        if (newCode.length === TOTAL_DIGITS) {
                            setStatusMessage("CODE POSTAL VALIDÉ !");
                            audio.playSuccess();
                            setTimeout(onComplete, 1500);
                        } else {
                            audio.playBlip(600, 'square');
                        }
                        return newCode;
                    });
                    
                    state.validationTimer = 0;
                    state.ball.vy += 15;
                    state.currentZoneIndex = -1;
                }
            } else {
                state.currentZoneIndex = digit;
                state.validationTimer = 0;
            }
        }

        if (state.fanSpeed > 0.1) {
            state.particles.push({
                x: Math.random() * width,
                y: height,
                vy: - (Math.random() * 5 + 2) * state.fanSpeed,
                size: Math.random() * 2 + 1
            });
        }
        for (let i = state.particles.length - 1; i >= 0; i--) {
            state.particles[i].y += state.particles[i].vy * timeFactor;
            if (state.particles[i].y < 0) state.particles.splice(i, 1);
        }

        ctx.clearRect(0, 0, width, height);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "bold 24px monospace";

        for (let i = 0; i < 10; i++) {
            let y = i * zoneHeight;
            let zoneDigit = 9 - i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.strokeStyle = "rgba(255,255,255,0.1)";
            ctx.stroke();

            if (zoneDigit === state.currentZoneIndex && postalCode.length < TOTAL_DIGITS) {
                let progress = state.validationTimer / TICKS_TO_VALIDATE;
                ctx.fillStyle = `rgba(16, 185, 129, ${0.1 + progress * 0.4})`;
                ctx.fillRect(0, y, width, zoneHeight);
                ctx.fillStyle = "#34d399";
                ctx.fillRect(0, y + zoneHeight - 4, width * progress, 4);
            }
            ctx.fillStyle = (zoneDigit === state.currentZoneIndex) ? "#fff" : "rgba(255,255,255,0.2)";
            ctx.fillText(zoneDigit.toString(), width / 2, y + zoneHeight / 2);
        }

        ctx.fillStyle = "rgba(100, 200, 255, 0.3)";
        state.particles.forEach(p => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.beginPath();
        ctx.arc(width / 2, state.ball.y, state.ball.radius, 0, Math.PI * 2);
        let stability = state.validationTimer / TICKS_TO_VALIDATE;
        if (stability > 0.7) ctx.fillStyle = "#10b981";
        else if (stability > 0.3) ctx.fillStyle = "#fbbf24";
        else ctx.fillStyle = "#ef4444";
        ctx.fill();
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.stroke();

        requestRef.current = requestAnimationFrame(loop);
    }, [postalCode.length, onComplete]); 

    useEffect(() => {
        lastTimeRef.current = 0; 
        requestRef.current = requestAnimationFrame(loop);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [loop]);

    const handleReset = () => {
        setPostalCode([]);
        gameState.current.validationTimer = 0;
        audio.playBlip(200, 'sawtooth');
    };

    return (
        <div className="h-screen w-full bg-slate-900 flex flex-col items-center justify-center p-4 font-mono select-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black -z-10"></div>
            
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h2 className="text-emerald-400 text-sm tracking-[0.3em] uppercase mb-2">Protocole de Sécurité Final</h2>
                <h1 className="text-3xl md:text-4xl font-black text-white mb-4">SAISIE DU CODE POSTAL</h1>
                <p className="text-slate-400 max-w-md mx-auto text-sm">
                    Veuillez entrer le code postal de l'établissement (5 chiffres) à l'aide du <span className="text-emerald-400 font-bold">Système de Lévitation Pneumatique</span>.
                </p>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-8 items-center justify-center w-full max-w-4xl">
                {/* TUBE (Canvas) */}
                <div className="relative p-2 bg-slate-800 rounded-2xl border-2 border-slate-700 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                    <canvas 
                        ref={canvasRef} 
                        width={180} 
                        height={500}
                        className="rounded-xl bg-slate-900/50 cursor-ns-resize"
                    />
                    <div className="absolute top-0 right-[-40px] h-full flex flex-col justify-between py-6 text-xs text-slate-600 font-bold">
                        <span>9</span>
                        <span>0</span>
                    </div>
                </div>

                {/* CONTROLS */}
                <div className="flex flex-col items-center gap-8 min-w-[300px]">
                    
                    {/* Display Ecran */}
                    <div className="bg-black border-2 border-emerald-500/50 rounded-lg p-6 w-full text-center shadow-[0_0_20px_rgba(16,185,129,0.2)_inset]">
                        <div className="text-4xl font-mono tracking-widest text-emerald-400 font-bold h-12 flex items-center justify-center">
                            {Array(TOTAL_DIGITS).fill(0).map((_, i) => (
                                <span key={i} className={`mx-1 ${i < postalCode.length ? 'text-emerald-400' : 'text-slate-700'}`}>
                                    {i < postalCode.length ? postalCode[i] : '_'}
                                </span>
                            ))}
                        </div>
                        <div className="text-xs text-emerald-600 mt-2 font-bold animate-pulse">
                            {postalCode.length === TOTAL_DIGITS ? "VALIDÉ !" : `CHIFFRE ${postalCode.length + 1}/${TOTAL_DIGITS}`}
                        </div>
                    </div>

                    {/* Big Red Button */}
                    <motion.button
                        className={`w-40 h-40 rounded-full border-8 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center transition-all outline-none ${
                            gameState.current.isButtonDown 
                            ? 'bg-red-600 border-red-900 scale-95 shadow-none' 
                            : 'bg-gradient-to-br from-red-500 to-red-700 border-red-900 hover:brightness-110 active:scale-95'
                        }`}
                        onMouseDown={startBlow}
                        onMouseUp={stopBlow}
                        onMouseLeave={stopBlow}
                        onTouchStart={(e) => { e.preventDefault(); startBlow(); }}
                        onTouchEnd={(e) => { e.preventDefault(); stopBlow(); }}
                    >
                        <span className="text-white/90 font-black text-xl drop-shadow-md">SOUFFLER</span>
                        <span className="text-red-900/50 text-xs font-bold mt-1">(Hold Space)</span>
                    </motion.button>

                    <button 
                        onClick={handleReset}
                        className="text-slate-500 text-xs hover:text-white underline decoration-slate-700 underline-offset-4 transition-colors"
                    >
                        Réinitialiser la saisie
                    </button>
                    
                    <div className="text-xs text-slate-500 text-center bg-slate-800/50 p-3 rounded border border-slate-700 max-w-xs">
                        <strong className="text-slate-300">MANUEL OPÉRATEUR :</strong><br/>
                        Maintenez le bouton pour faire léviter la balle. Stabilisez-la devant le chiffre désiré pendant 2 secondes. L'inertie est votre ennemie.
                    </div>
                </div>
            </div>
        </div>
    );
}