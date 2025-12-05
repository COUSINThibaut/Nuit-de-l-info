import React from 'react';
import { Environment, ContactShadows, Sparkles } from '@react-three/drei';
import { CrystalCore } from './CrystalCore';

export const HeroScene = () => {
  return (
    <>
      <color attach="background" args={['#020617']} />
      <Environment preset="city" blur={0.6} backgroundIntensity={0.2} />
      
      <ambientLight intensity={0.2} />
      <spotLight position={[20, 20, 10]} angle={0.2} penumbra={1} intensity={4} color="#a7f3d0" castShadow />
      <pointLight position={[-10, -5, 5]} intensity={2} color="#3b82f6" />
      
      <group position={[3, 0, 0]}> 
         <CrystalCore />
         <ContactShadows position={[0, -4, 0]} opacity={0.6} scale={15} blur={3} color="#0d9488"/>
      </group>
      
      <Sparkles count={300} scale={15} size={2} speed={0.5} opacity={0.4} color="#60a5fa" />
    </>
  );
};