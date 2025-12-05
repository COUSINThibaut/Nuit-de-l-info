import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Environment, 
  RoundedBox, 
  ContactShadows,
  Float,
  PerspectiveCamera,
  Text,
  Html
} from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const PC_POS = new THREE.Vector3(2.6, -1.2, -4); 
const PORT_OFFSET = new THREE.Vector3(0, 1.6, 2.05); 
const TARGET_WORLD_POS = new THREE.Vector3(
    PC_POS.x + PORT_OFFSET.x, 
    PC_POS.y + PORT_OFFSET.y, 
    PC_POS.z + PORT_OFFSET.z
);

const ALIGNMENT_THRESHOLD = 0.8; 

const Materials = {
    CaseBlack: new THREE.MeshStandardMaterial({ color: "#151515", roughness: 0.5, metalness: 0.5 }),
    CaseSilver: new THREE.MeshStandardMaterial({ color: "#e2e8f0", roughness: 0.3, metalness: 0.8 }), 
    PortPlastic: new THREE.MeshStandardMaterial({ color: "#111", roughness: 0.8 }),
    PortBlue: new THREE.MeshStandardMaterial({ color: "#2563eb", roughness: 0.2 }),
    LedRed: new THREE.MeshStandardMaterial({ color: "#ff0000", emissive: "#ff0000", emissiveIntensity: 3, toneMapped: false }),
    NeonGreen: new THREE.MeshBasicMaterial({ color: "#00ff88", transparent: true, opacity: 0.8 }),
    NeonRed: new THREE.MeshBasicMaterial({ color: "#ff3333", transparent: true, opacity: 0.5 }),
    ScreenGlow: new THREE.MeshStandardMaterial({ color: "#000", emissive: "#1d4ed8", emissiveIntensity: 2 }),
    ScreenBoot: new THREE.MeshBasicMaterial({ color: "#000" }), // Écran noir pour le boot
    Desk: new THREE.MeshStandardMaterial({ color: "#1e293b", roughness: 0.9 }),
    Peripherals: new THREE.MeshStandardMaterial({ color: "#222", roughness: 0.7 })
};

function Room({ booting }: { booting: boolean }) {
    return (
        <group>
            {/* MURS & SOL */}
            <mesh position={[0, 5, -10]} receiveShadow>
                <planeGeometry args={[50, 30]} />
                <meshStandardMaterial color="#020617" roughness={0.9} />
            </mesh>
            <mesh position={[0, -3.5, -2]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
                <planeGeometry args={[30, 15]} />
                <primitive object={Materials.Desk} />
            </mesh>

            {/* SETUP ÉCRAN + PÉRIPHÉRIQUES */}
            <group position={[-2.5, 0.5, -4]} rotation={[0, 0.3, 0]}>
                
                {/* Moniteur */}
                <RoundedBox args={[7, 4, 0.2]} radius={0.1}>
                    <meshStandardMaterial color="#111" />
                </RoundedBox>
                
                {/* Dalle de l'écran (6.8 x 3.8 unités) */}
                <mesh position={[0, 0, 0.11]}>
                    <planeGeometry args={[6.8, 3.8]} />
                    {/* Si booting, écran noir, sinon glow bleu */}
                    <primitive object={booting ? Materials.ScreenBoot : Materials.ScreenGlow} />
                </mesh>

{/* CONTENU BOOT SUR L'ÉCRAN 3D */}
{booting && (
    <Html 
        transform 
        position={[0, 0, 0.12]} 
        rotation={[0, 0, 0]} 
        scale={0.1} 
        occlude="blending"
        style={{
            width: '1360px',
            height: '760px',
            backgroundColor: '#0c0c0c',
            color: '#a7f3d0',
            fontFamily: '"Fira Code", "Consolas", monospace',
            padding: '0',
            fontSize: '32px', 
            fontWeight: '500',
            overflow: 'hidden',
            userSelect: 'none',
            border: '2px solid #333'
        }}
    >
        {/* En-tête de fenêtre terminal */}
        <div className="bg-[#1f2937] text-gray-400 px-6 py-3 flex justify-between items-center border-b border-gray-700 text-2xl">
            <div className="flex gap-3">
                <span className="w-4 h-4 rounded-full bg-red-500/50"></span>
                <span className="w-4 h-4 rounded-full bg-yellow-500/50"></span>
                <span className="w-4 h-4 rounded-full bg-green-500/50"></span>
            </div>
            <div className="font-mono text-sm tracking-widest">root@usb-live:~</div>
            <div>bash</div>
        </div>

        {/* Corps du terminal */}
        <div className="p-10 flex flex-col h-full font-mono relative">
            
            {/* Ligne de commande initiale */}
            <div className="mb-6 text-white">
                <span className="text-green-500">root@usb-live:~$</span> ./nird_deploy_v2.sh --force --overwrite-windows
            </div>

            {/* Logs d'exécution rapides */}
            <div className="flex flex-col gap-2 opacity-90">
                <p>[ <span className="text-green-500">OK</span> ] Verifying installation media integrity...</p>
                <p>[ <span className="text-green-500">OK</span> ] Mounting /dev/sdb1 as /mnt/usb...</p>
                <p>[ <span className="text-yellow-400">INFO</span> ] Target detected: NVMe SSD 1TB (Windows 11)</p>
                <p className="animate-pulse">[ <span className="text-red-400">WARN</span> ] Formatting partition /dev/nvme0n1p3 (System)...</p>
                <p>[ <span className="text-green-500">OK</span> ] File system created: ext4</p>
                <p>[ <span className="text-blue-400">COPY</span> ] Copying kernel image (vmlinuz-6.8.0)...</p>
            </div>

            {/* Barre de progression style ASCII "Pro" */}
            <div className="mt-auto mb-12">
                <div className="flex justify-between text-xl mb-2 text-gray-400">
                    <span>STATUS: DEPLOYING IMAGE</span>
                    <span>100%</span>
                </div>
                <div className="w-full bg-gray-800 h-8 border border-gray-600 p-1">
                    <div 
                        className="h-full bg-emerald-500 animate-[width_1.8s_steps(20)_forwards]" 
                        style={{width: '0%'}}
                    ></div>
                </div>
                <div className="mt-4 text-gray-500 text-xl animate-pulse">
                    &gt; Rebooting system in 3... 2... 1...
                </div>
            </div>

            {/* Scanlines subtiles pour l'effet écran */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] pointer-events-none opacity-20"></div>
        </div>
    </Html>
)}                {/* Lumière écran */}
                {!booting && (
                    <rectAreaLight width={6.8} height={3.8} intensity={8} color="#3b82f6" position={[0, 0, 0.5]} rotation={[0, Math.PI, 0]} />
                )}

                {/* Pied de l'écran */}
                <group position={[0, -3, 0]}>
                    <mesh position={[0, 1, -0.1]}>
                        <boxGeometry args={[0.8, 2.5, 0.2]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                    <mesh position={[0, 0, 0]}>
                        <boxGeometry args={[2, 0.1, 1.5]} />
                        <meshStandardMaterial color="#111" />
                    </mesh>
                </group>
            </group>

            {/* Clavier et Souris */}
            <group position={[-2.5, -3.4, -2]} rotation={[0, 0.3, 0]}>
                <RoundedBox args={[3.2, 0.15, 1.3]} radius={0.05} position={[0, 0, 0]}>
                    <primitive object={Materials.Peripherals} />
                    <mesh position={[0, 0.08, 0]} rotation={[-Math.PI/2,0,0]}>
                         <planeGeometry args={[3.0, 1.1]} />
                         <meshStandardMaterial color="#000" emissive="#00ff88" emissiveIntensity={0.2} />
                    </mesh>
                </RoundedBox>

                <RoundedBox args={[0.35, 0.15, 0.6]} radius={0.08} position={[2.2, 0, 0.2]}>
                    <primitive object={Materials.Peripherals} />
                    <mesh position={[0, 0.08, 0.1]}>
                        <boxGeometry args={[0.02, 0.02, 0.05]} />
                        <meshBasicMaterial color="#00ff88" />
                    </mesh>
                </RoundedBox>

                <mesh position={[2.2, -0.04, 0]} rotation={[-Math.PI/2, 0, 0]}>
                    <planeGeometry args={[1, 0.8]} />
                    <meshStandardMaterial color="#111" roughness={1} />
                </mesh>
            </group>
        </group>
    );
}

function ComputerTower({ isAligned }: { isAligned: boolean }) {
    const guideRef = useRef<THREE.Group>(null);
    const ledRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (guideRef.current) {
            const speed = isAligned ? 10 : 3;
            guideRef.current.position.z = 0.1 + Math.sin(state.clock.elapsedTime * speed) * 0.05;
            if(isAligned) guideRef.current.rotation.z += 0.05;
        }
        if (ledRef.current) {
            ledRef.current.visible = Math.random() > 0.8;
        }
    });

    return (
        <group position={PC_POS.toArray()}>
            <RoundedBox args={[2.8, 5.5, 4]} radius={0.1} castShadow receiveShadow>
                <primitive object={Materials.CaseBlack} />
            </RoundedBox>

            <mesh position={[0, -1, 2.01]}>
                <planeGeometry args={[2.6, 3.3]} />
                <meshStandardMaterial color="#0a0a0a" roughness={0.8} />
            </mesh>

            <RoundedBox args={[2.6, 1.8, 0.05]} radius={0.05} position={[0, 1.5, 2.02]}>
                <primitive object={Materials.CaseSilver} />
            </RoundedBox>
            
            {[-1.1, 1.1].map((x, i) => (
                <mesh key={i} position={[x, 2.2, 2.05]}>
                    <circleGeometry args={[0.05]} />
                    <meshStandardMaterial color="#555" metalness={1} />
                </mesh>
            ))}

            <group position={PORT_OFFSET.toArray()}>
                <pointLight position={[0, 0, 1]} distance={2} intensity={isAligned ? 5 : 2} color={isAligned ? "#00ff88" : "white"} />

                <mesh position={[0, 0, 0.04]}> 
                    <boxGeometry args={[0.7, 0.3, 0.05]} />
                    <primitive object={Materials.PortPlastic} />
                </mesh>
                <mesh position={[0, 0.05, 0.05]}>
                    <boxGeometry args={[0.5, 0.05, 0.05]} />
                    <primitive object={Materials.PortBlue} />
                </mesh>
                <mesh position={[0, 0, 0.03]}>
                    <planeGeometry args={[0.6, 0.2]} />
                    <meshBasicMaterial color="#000" />
                </mesh>

                <group position={[0.6, 0, 0.05]}>
                     <mesh ref={ledRef}>
                        <circleGeometry args={[0.05]} />
                        <primitive object={Materials.LedRed} />
                     </mesh>
                     <Text position={[0, -0.15, 0]} fontSize={0.08} color="#555">HDD</Text>
                </group>

                <Text position={[-0.6, 0, 0.05]} fontSize={0.1} color="#333" font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff">
                    USB 3.0
                </Text>

                <group ref={guideRef}>
                    <mesh position={[0, 0, 0]}>
                        <ringGeometry args={[0.4, 0.45, 32]} />
                        <primitive object={isAligned ? Materials.NeonGreen : Materials.NeonRed} />
                    </mesh>
                    {isAligned && (
                        <mesh position={[0, 0.6, 0]}>
                            <coneGeometry args={[0.15, 0.3, 3]} />
                            <primitive object={Materials.NeonGreen} />
                        </mesh>
                    )}
                </group>
            </group>
            
            <group position={[0, -1.5, 2.05]}>
                 <mesh>
                    <ringGeometry args={[0.8, 0.9, 32]} />
                    <meshBasicMaterial color="#333" />
                 </mesh>
                 <pointLight distance={2} intensity={3} color="#00ff88" />
            </group>
        </group>
    );
}

function UsbKey({ isHolding, mousePos, inserted, setIsAlignedParent }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const START_POS = new THREE.Vector3(0.5, -0.5, 1); 
  const INSERTED_POS = TARGET_WORLD_POS.clone().add(new THREE.Vector3(0, 0, 0.3));
  
  const prevAligned = useRef(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (inserted) {
        groupRef.current.position.lerp(INSERTED_POS, delta * 15);
        groupRef.current.rotation.set(0, 0, 0); 
        return;
    }

    const targetX = START_POS.x + (mousePos.x * 5); 
    const targetY = START_POS.y + (mousePos.y * 4); 
    
    const dist = Math.sqrt(
        Math.pow(targetX - TARGET_WORLD_POS.x, 2) + 
        Math.pow(targetY - TARGET_WORLD_POS.y, 2)
    );
    
    const isAligned = dist < ALIGNMENT_THRESHOLD;
    
    if (isAligned !== prevAligned.current) {
        setIsAlignedParent(isAligned);
        prevAligned.current = isAligned;
    }

    let targetZ = START_POS.z;
    let finalX = targetX;
    let finalY = targetY;

    if (isAligned) {
        finalX = THREE.MathUtils.lerp(targetX, TARGET_WORLD_POS.x, 0.5); 
        finalY = THREE.MathUtils.lerp(targetY, TARGET_WORLD_POS.y, 0.5);
    }

    if (isHolding) {
        if (isAligned) {
            targetZ = TARGET_WORLD_POS.z + 0.6; 
            finalX = THREE.MathUtils.lerp(finalX, TARGET_WORLD_POS.x, 0.8);
            finalY = THREE.MathUtils.lerp(finalY, TARGET_WORLD_POS.y, 0.8);
        } else {
            targetZ = START_POS.z - 0.2; 
        }
    }

    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, finalX, delta * 8);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, finalY, delta * 8);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, delta * 8);

    if (isAligned) {
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, delta * 10);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, delta * 10);
    } else {
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, (mousePos.x * -0.3), delta * 5);
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, (mousePos.y * 0.3), delta * 5);
    }
  });

  return (
    <group ref={groupRef} position={[START_POS.x, START_POS.y, START_POS.z]}>
        <group scale={0.4}>
            <mesh castShadow>
                <boxGeometry args={[1, 0.3, 2.5]} />
                <meshStandardMaterial color="#222" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0, -1.5]}>
                <boxGeometry args={[0.7, 0.2, 0.6]} />
                <meshStandardMaterial color="#fff" metalness={1} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0, 1]}>
                <sphereGeometry args={[0.1]} />
                <primitive object={Materials.LedRed} />
                <pointLight distance={1} intensity={2} color="red" />
            </mesh>
        </group>
    </group>
  );
}

function Scene({ isHolding, onSuccess, triggerGlitch, mousePos, setIsAligned, booting, setBooting }: any) {
    const [inserted, setInserted] = useState(false);
    const [alignedLocal, setAlignedLocal] = useState(false);
    const { camera } = useThree();
    const lookAtTarget = useRef(new THREE.Vector3(0, 0, -4));
    
    const holdTime = useRef(0);

    const handleAlignment = (val: boolean) => {
        setAlignedLocal(val);
        setIsAligned(val);
    };

    useFrame((state, delta) => {
        if (booting) {
            const screenCenter = new THREE.Vector3(-2.5, 0.5, -4);
            const angle = 0.3;
            const distance = 1.8;

            const targetCamPos = new THREE.Vector3(
                screenCenter.x + Math.sin(angle) * distance,
                0.5,
                screenCenter.z + Math.cos(angle) * distance
            );

            state.camera.position.lerp(targetCamPos, delta * 2.5);
            lookAtTarget.current.lerp(screenCenter, delta * 3);
            state.camera.lookAt(lookAtTarget.current);
            return;
        }

        if (inserted) return;
        
        if (isHolding && alignedLocal) {
             holdTime.current += delta;
             
             if (holdTime.current > 0.3) {
                 setInserted(true);
                 triggerGlitch();
                 if(navigator.vibrate) navigator.vibrate([50, 50, 50]);
                 
                 setTimeout(() => {
                     setBooting(true); 
                     setTimeout(onSuccess, 2000); 
                 }, 600);
             }
        } else {
            holdTime.current = 0;
        }
    });

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 5.5]} fov={50} />
            
            <ambientLight intensity={0.4} />
            <pointLight position={[2, 2, 5]} intensity={0.8} color="#ffffff" />
            
            <Room booting={booting} />
            <ComputerTower isAligned={alignedLocal} />
            
            <Float floatIntensity={inserted ? 0 : 0.5} rotationIntensity={inserted ? 0 : 0.1}>
                <UsbKey 
                    isHolding={isHolding} 
                    mousePos={mousePos} 
                    inserted={inserted} 
                    setIsAlignedParent={handleAlignment}
                />
            </Float>

            <ContactShadows opacity={0.6} scale={20} blur={2} far={10} color="#000" />
            <Environment preset="city" />
        </>
    );
}

export default function Lobby({ onSuccess, triggerGlitch, initAudio }: { onSuccess: () => void, triggerGlitch: () => void, initAudio?: () => void }) {
  const [isHolding, setIsHolding] = useState(false);
  const [mousePos, setMousePos] = useState({x: 0, y: 0});
  const [isAligned, setIsAligned] = useState(false); 
  const [booting, setBooting] = useState(false); 

  return (
    <div 
        className="h-screen w-full bg-[#111] relative overflow-hidden cursor-none"
        onMouseDown={() => {
            if(initAudio) initAudio();
            !booting && setIsHolding(true);
        }}
        onMouseUp={() => setIsHolding(false)}
        onMouseLeave={() => setIsHolding(false)}
        onMouseMove={(e) => setMousePos({
            x: (e.clientX / window.innerWidth) * 2 - 1,
            y: -(e.clientY / window.innerHeight) * 2 + 1
        })}
    >
      {/* UI Overlay */}
      <motion.div 
         animate={{ opacity: booting ? 0 : 1 }}
         className="absolute top-10 left-0 w-full text-center pointer-events-none z-10"
      >
         <h1 className="text-white font-bold tracking-[0.3em] text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">INJECTION SYSTÈME</h1>
         
         <div className={`mt-4 inline-block px-6 py-2 rounded border transition-all duration-200 ${
             isAligned 
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 scale-110" 
                : "bg-black/40 border-slate-700 text-slate-500"
         }`}>
            <p className="font-mono text-sm font-bold">
                {isHolding 
                    ? (isAligned ? ">>> INJECTION EN COURS <<<" : "CIBLE MANQUÉE - REPOSITIONNEZ")
                    : (isAligned ? "CIBLE VERROUILLÉE ! CLIQUEZ !" : "CHERCHEZ LE SIGNAL...")}
            </p>
         </div>
      </motion.div>

      {/* Viseur */}
      {!booting && (
          <motion.div 
            className="fixed w-6 h-6 border-2 border-white rounded-full pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2 mix-blend-difference flex items-center justify-center"
            animate={{
                x: (mousePos.x + 1) / 2 * window.innerWidth,
                y: (-mousePos.y + 1) / 2 * window.innerHeight,
                scale: isHolding ? 0.5 : 1,
                borderColor: isAligned ? '#00ff88' : '#ffffff'
            }}
            transition={{ duration: 0 }}
          >
            <div className={`w-1 h-1 rounded-full ${isAligned ? 'bg-emerald-500' : 'bg-red-500'}`} />
          </motion.div>
      )}

      <Canvas shadows dpr={[1, 1.5]}>
         <Scene 
            isHolding={isHolding} 
            onSuccess={onSuccess} 
            triggerGlitch={triggerGlitch} 
            mousePos={mousePos}
            setIsAligned={setIsAligned}
            booting={booting}
            setBooting={setBooting}
         />
      </Canvas>
    </div>
  );
}