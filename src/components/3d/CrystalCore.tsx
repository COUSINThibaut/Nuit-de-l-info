import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

export const CrystalCore = () => {
  const groupRef = useRef<THREE.Group>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const { pointer } = state;

    if (outerRef.current) {
      outerRef.current.rotation.x = t * 0.1;
      outerRef.current.rotation.y = t * 0.15;
    }
    if (innerRef.current) {
        innerRef.current.scale.setScalar(0.8 + Math.sin(t * 1.5) * 0.1);
    }
    if (ringRef.current) {
       ringRef.current.rotation.z = t * 0.2;
       ringRef.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.5) * 0.2;
    }

    if (groupRef.current) {
        groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, pointer.x * 0.5, 0.1);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -pointer.y * 0.5, 0.1);
    }
  });

  return (
    <group ref={groupRef}>
        <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} scale={1.5}>
           <torusGeometry args={[2.2, 0.05, 16, 100]} />
           <meshStandardMaterial color="#60a5fa" emissive="#3b82f6" emissiveIntensity={3} toneMapped={false} />
        </mesh>

      <Float speed={3} rotationIntensity={0.5} floatIntensity={1.5}>
        <group>
            <mesh ref={innerRef}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={4} toneMapped={false} />
            </mesh>
            <mesh ref={outerRef} scale={1.2}>
                <torusKnotGeometry args={[1, 0.35, 256, 32]} />
                <MeshTransmissionMaterial
                    backside={false} samples={6} resolution={1024} thickness={0.8} roughness={0} anisotropy={0.3}
                    chromaticAberration={0.06} ior={1.6} color="#e0f2fe" attenuationColor="#10b981" attenuationDistance={1.5}
                />
            </mesh>
        </group>
      </Float>
    </group>
  );
};