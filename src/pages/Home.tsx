import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { HeroScene } from '../components/3d/HeroScene';
import { Interface } from '../components/ui/Interface';

export default function Home() {
  const navigate = useNavigate();

  const handleEnter = () => {
    navigate('/game');
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 9], fov: 40 }} dpr={[1, 2]}>
           <HeroScene />
        </Canvas>
      </div>

      <Interface onEnter={handleEnter} />
      <div className="absolute bottom-10 w-full text-center text-[10px] text-slate-500/60 z-20 font-mono pointer-events-none">
        MISSION : DÉPROGRAMMER L'OBSOLESCENCE // 2025
      </div>
      
    </div>
  );
}