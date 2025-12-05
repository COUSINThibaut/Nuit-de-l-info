import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, Upload, FastForward, Globe, Music, Link as LinkIcon, Mic, StopCircle, Eye, EyeOff } from 'lucide-react';
import * as THREE from 'three';

// --- Types ---
interface AudioFile {
  name: string;
  url: string;
}

const AudioUploader: React.FC = () => {
  // --- États ---
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true); // Gère la visibilité basée sur l'activité
  const [isDragging, setIsDragging] = useState(false);
  
  // Navigation & Modes
  const [activeTab, setActiveTab] = useState<'local' | 'spotify' | 'mic'>('local');
  const [isMicActive, setIsMicActive] = useState(false);
  const [isUIHidden, setIsUIHidden] = useState(false); // Mode "Cinéma" manuel (Bouton Oeil)

  // --- Références ---
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const controlsTimeoutRef = useRef<number | undefined>(undefined); // Timer pour l'inactivité
  
  // Audio Web API
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
  // Three.js Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const requestRef = useRef<number>();
  
  // Objets 3D Refs
  const towersMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const reflectionMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const roadLinesMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  
  // Buffers Audio & Maths
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const frequencyArrayRef = useRef<Uint8Array | null>(null);
  const dummy = new THREE.Object3D(); 
  const colorDummy = new THREE.Color();

  // --- 1. Initialisation Three.js ---
  useEffect(() => {
    if (!containerRef.current) return;

    // Scène
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); 
    scene.fog = new THREE.FogExp2(0x000000, 0.03); 
    sceneRef.current = scene;

    // Caméra
    const camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1, 10); 
    camera.lookAt(0, 4, -50); 
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Sol
    const roadGeo = new THREE.PlaneGeometry(200, 400);
    const roadMat = new THREE.MeshBasicMaterial({ 
        color: 0x050505, 
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.y = 0.05; 
    scene.add(road);

    // Grille décorative
    const gridHelper = new THREE.GridHelper(200, 100, 0x222222, 0x000000);
    gridHelper.position.y = 0.06;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // Lignes de route
    const lineGeo = new THREE.BoxGeometry(0.2, 0.02, 4);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const linesCount = 40;
    const linesMesh = new THREE.InstancedMesh(lineGeo, lineMat, linesCount);
    linesMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    
    for(let k=0; k<linesCount; k++) {
        const z = (k * 10) - 200;
        dummy.position.set(0, 0.07, z);
        dummy.scale.set(1,1,1);
        dummy.updateMatrix();
        linesMesh.setMatrixAt(k, dummy.matrix);
        
        if(!linesMesh.userData.baseZ) linesMesh.userData.baseZ = [];
        linesMesh.userData.baseZ[k] = z;
    }
    scene.add(linesMesh);
    roadLinesMeshRef.current = linesMesh;

    // Bâtiments
    const geometry = new THREE.BoxGeometry(1.5, 1, 1.5);
    geometry.translate(0, 0.5, 0); 
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const gridSizeX = 20; 
    const gridSizeZ = 60; 
    const count = gridSizeX * gridSizeZ;
    
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const reflectionMesh = new THREE.InstancedMesh(geometry, material, count);
    reflectionMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    let i = 0;
    const spacingX = 6; 
    const spacingZ = 6; 

    for (let x = 0; x < gridSizeX; x++) {
        for (let z = 0; z < gridSizeZ; z++) {
            const posX = (x - gridSizeX/2) * spacingX;
            const posZ = (z - gridSizeZ/2) * spacingZ;
            
            if (!mesh.userData.infos) mesh.userData.infos = [];
            const reactiveType = Math.floor(Math.random() * 3);
            const colorVariation = Math.random(); 
            const widthScale = Math.random() > 0.7 ? 1.5 + Math.random() * 2 : 1;

            mesh.userData.infos[i] = { 
                baseX: posX, 
                baseZ: posZ,
                isStreet: Math.abs(posX) < 3, 
                reactiveType: reactiveType, 
                colorVariation: colorVariation,
                widthScale: widthScale
            };
            i++;
        }
    }
    scene.add(mesh);
    towersMeshRef.current = mesh;
    scene.add(reflectionMesh);
    reflectionMeshRef.current = reflectionMesh;

    // Resize Event
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Démarrage animation
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // --- 2. Boucle d'animation (Visualizer) ---
  const animate = () => {
    requestRef.current = requestAnimationFrame(animate);

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current; 
    const freqArray = frequencyArrayRef.current;
    
    const mesh = towersMeshRef.current;
    const reflection = reflectionMeshRef.current;
    const roadLines = roadLinesMeshRef.current;
    const gridHelper = gridHelperRef.current;
    
    const renderer = rendererRef.current;
    const scene = sceneRef.current;
    const camera = cameraRef.current;

    const time = Date.now() * 0.001;
    let bass = 0, mid = 0, treble = 0;
    
    if (analyser && dataArray && freqArray) {
        analyser.getByteTimeDomainData(dataArray); 
        analyser.getByteFrequencyData(freqArray);
        
        const bRange = freqArray.slice(0, 5); 
        bass = (bRange.reduce((a, b) => a + b) / bRange.length) / 255; 

        const mRange = freqArray.slice(20, 60); 
        mid = (mRange.reduce((a,b)=>a+b)/mRange.length) / 255;

        const tRange = freqArray.slice(100, 150); 
        treble = (tRange.reduce((a,b)=>a+b)/tRange.length) / 255;
    }

    const speed = 8; 
    const zOffset = time * speed;
    const depth = 360; 
    const soundHeat = Math.min(1, bass * 0.8 + mid * 0.4); 

    // Animation Bâtiments
    if (mesh && reflection) {
        for (let i = 0; i < mesh.count; i++) {
            const info = mesh.userData.infos[i];
            
            if (info.isStreet) {
                dummy.position.set(0, -1000, 0);
                dummy.updateMatrix();
                mesh.setMatrixAt(i, dummy.matrix);
                reflection.setMatrixAt(i, dummy.matrix);
                continue;
            }

            let z = (info.baseZ + zOffset) % depth;
            if (z > 20) z -= depth; 

            let h = 2; 
            h += bass * 4; 
            const wave = Math.sin(z * 0.1 + time * 2) * mid * 6;
            if (info.reactiveType === 1) h += Math.abs(wave);
            if (info.reactiveType === 2) h += treble * 5 * Math.random();
            h += Math.sin(info.baseX * 0.2 + time) * 1.5;
            
            const squashScale = Math.max(0.6, 1 - (h * 0.05));
            const finalWidth = info.widthScale * squashScale;

            dummy.position.set(info.baseX, 0, z);
            dummy.scale.set(finalWidth, h, finalWidth);
            dummy.rotation.set(0, 0, 0);
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);

            dummy.scale.set(finalWidth, -h, finalWidth); 
            dummy.updateMatrix();
            reflection.setMatrixAt(i, dummy.matrix);

            // Couleurs
            const coldHue = 0.5 + (info.colorVariation * 0.25);
            const hotHue = (coldHue + 0.4 + (info.colorVariation * 0.1)) % 1.0;
            const timeShift = Math.sin(time * 0.5 + info.baseX) * 0.05;
            let finalHue = THREE.MathUtils.lerp(coldHue, hotHue, soundHeat);
            finalHue = (finalHue + timeShift) % 1.0;

            const sat = 0.6 + (soundHeat * 0.4);
            const light = 0.2 + (soundHeat * 0.6); 

            if (info.reactiveType === 2 && treble > 0.6) {
                colorDummy.setHSL(0.55, 0.2, 1.0); 
            } else {
                colorDummy.setHSL(finalHue, sat, light);
            }
            
            mesh.setColorAt(i, colorDummy);
            colorDummy.setHSL(finalHue, sat * 0.8, light * 0.6); 
            reflection.setColorAt(i, colorDummy);
        }
        mesh.instanceMatrix.needsUpdate = true;
        mesh.instanceColor!.needsUpdate = true;
        reflection.instanceMatrix.needsUpdate = true;
        reflection.instanceColor!.needsUpdate = true;
    }

    // Animation Route
    if (roadLines) {
        const roadDepth = 400; 
        for (let k = 0; k < roadLines.count; k++) {
            const baseZ = roadLines.userData.baseZ[k];
            let z = (baseZ + zOffset) % roadDepth;
            if (z > 20) z -= roadDepth; 

            dummy.position.set(0, 0.07, z);
            dummy.scale.set(1, 1, 1);
            dummy.rotation.set(0,0,0);
            dummy.updateMatrix();
            roadLines.setMatrixAt(k, dummy.matrix);
        }
        roadLines.instanceMatrix.needsUpdate = true;
    }

    // Animation Grille
    if (gridHelper) {
        const gridOffset = (time * speed) % 2; 
        gridHelper.position.z = 0.06 + gridOffset;
    }

    if (camera) {
        camera.position.x = 0;
        camera.position.y = 1;
    }

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
  };

  // --- 3. Gestion Audio (Fichier Local) ---
  const initAudioContextFile = useCallback(() => {
    if (!audioRef.current || !audioFile || audioContextRef.current) return;
    
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = ctx;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;
    dataArrayRef.current = new Uint8Array(analyser.fftSize);
    frequencyArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    
    const source = ctx.createMediaElementSource(audioRef.current);
    source.connect(analyser);
    analyser.connect(ctx.destination);
    
  }, [audioFile]);

  const togglePlayFile = async () => {
    if (!audioRef.current || !audioFile) return;

    if (!audioContextRef.current) {
      initAudioContextFile();
    }
    
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  // --- 4. Gestion Audio (Microphone) ---
  const stopMicrophone = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsMicActive(false);
    setIsPlaying(false);
  }, []);

  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;
      
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      dataArrayRef.current = new Uint8Array(analyser.fftSize);
      frequencyArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser); 
      // NOTE: On ne connecte PAS à ctx.destination pour éviter le larsen (feedback)

      setIsMicActive(true);
      setIsPlaying(true); // Active la boucle visuelle

    } catch (err) {
      console.error("Erreur accès micro:", err);
      alert("Impossible d'accéder au microphone.");
    }
  };

  // --- 5. Navigation & Events ---
  const switchTab = (tab: 'local' | 'spotify' | 'mic') => {
    if (isPlaying) {
        if(audioRef.current) audioRef.current.pause();
        stopMicrophone();
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }
    setAudioFile(null);
    setIsPlaying(false);
    setActiveTab(tab);
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      setAudioFile({ name: file.name, url });
      switchTab('local'); 
      setAudioFile({ name: file.name, url }); 
      setIsPlaying(false);
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      processFile(file);
      event.target.value = '';
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  // --- Logic : Auto-Hide UI ---
  const handleMouseMove = useCallback(() => {
    if (!showControls) setShowControls(true);
    
    // Reset du timer à chaque mouvement
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    
    // Si on joue, on masque après 3 secondes d'inactivité
    if (isPlaying || isMicActive) {
      controlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying, isMicActive, showControls]);

  useEffect(() => {
    // Si on met en pause, on montre les contrôles et on annule le timer
    if (!isPlaying && !isMicActive) {
      setShowControls(true);
      if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    } else {
        // Lance le timer dès qu'on commence à jouer
        if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = window.setTimeout(() => {
            setShowControls(false);
        }, 3000);
    }
    return () => {
        if (controlsTimeoutRef.current) window.clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying, isMicActive]);


  // --- Helpers UI Visibility ---
  // Si caché manuellement (Bouton Oeil) OU caché par inactivité (showControls=false)
  const isHidden = isUIHidden || (!showControls && (isPlaying || isMicActive));
  const uiVisibilityClass = isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto';

  // --- 6. Composants UI Internes ---
  const SpotifyConnectUI = () => (
    <div className={`p-8 space-y-6 text-center animate-in fade-in zoom-in duration-300 transition-opacity duration-500 ${uiVisibilityClass}`}>
      <Music className="w-16 h-16 text-green-400 mx-auto" />
      <h2 className="text-3xl font-extrabold text-white">Connexion Spotify</h2>
      <p className="text-gray-400 max-w-md mx-auto">
        Connectez-vous pour visualiser la musique de votre compte Spotify.
      </p>
      <button className="inline-flex items-center justify-center bg-green-500 text-white px-8 py-3 text-lg font-bold uppercase tracking-widest rounded-full shadow-lg hover:bg-green-400 transition-all gap-2">
        <LinkIcon className="w-5 h-5" /> Lancer l'authentification
      </button>
    </div>
  );

  const LocalDropZoneUI = () => (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`
        max-w-3xl mx-auto p-12 mt-10 border-4 border-dashed rounded-xl cursor-pointer transition-all duration-500 ${uiVisibilityClass}
        ${isDragging ? 'border-cyan-400 bg-cyan-900/30 shadow-[0_0_40px_rgba(0,255,255,0.7)]' : 'border-gray-500 bg-black/50 hover:border-white/50'}
      `}
    >
      <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
      <div className="text-center space-y-3">
        <Upload className={`w-10 h-10 mx-auto ${isDragging ? 'text-cyan-400' : 'text-gray-400'}`} />
        <p className="text-xl font-bold">Glissez-déposez un MP3 ici</p>
        <p className="text-sm text-gray-400">ou cliquez pour sélectionner</p>
      </div>
    </div>
  );

  const MicrophoneUI = () => (
    <div className={`p-8 space-y-6 text-center animate-in fade-in zoom-in duration-300 transition-opacity duration-500 ${uiVisibilityClass}`}>
        <Mic className={`w-20 h-20 mx-auto transition-all ${isMicActive ? 'text-rose-500 animate-pulse' : 'text-gray-600'}`} />
        <h2 className="text-3xl font-extrabold text-white">Visualisation Live</h2>
        <p className="text-gray-400 max-w-md mx-auto">
        Utilisez votre microphone pour animer la ville en temps réel. 
        <br/><span className="text-xs text-rose-400">(Aucun son ne sera enregistré ni diffusé sur les enceintes)</span>
        </p>
        
        {!isMicActive ? (
        <button 
            onClick={startMicrophone}
            className="inline-flex items-center justify-center bg-rose-600 text-white px-8 py-4 text-xl font-bold rounded-full shadow-[0_0_30px_rgba(225,29,72,0.6)] hover:bg-rose-500 hover:scale-105 transition-all gap-3"
        >
            <Mic className="w-6 h-6" /> Activer le Micro
        </button>
        ) : (
        <button 
            onClick={stopMicrophone}
            className="inline-flex items-center justify-center bg-gray-800 text-white px-8 py-4 text-xl font-bold rounded-full border border-red-500/50 hover:bg-gray-700 transition-all gap-3"
        >
            <StopCircle className="w-6 h-6 text-red-500" /> Arrêter l'écoute
        </button>
        )}
    </div>
  );

  return (
    <div 
      className="relative w-full h-screen bg-black overflow-hidden font-sans text-white select-none"
      onMouseMove={handleMouseMove} // Détection d'activité
    >
      <div ref={containerRef} className="absolute inset-0 z-0" />

      {/* Interface Principale */}
      <div 
        className={`absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-8 transition-all duration-500`}
        style={{ 
          pointerEvents: 'none', // Par défaut le container ne bloque pas, seuls les enfants interactifs le font
          background: (isPlaying || isMicActive || isUIHidden) ? 'transparent' : 'rgba(0,0,0,0.5)' 
        }}
      >
        {/* Header (Titre + Bouton Visibilité) */}
        <div className="flex justify-between items-center relative z-20 pointer-events-auto">
            <div className={`flex items-center gap-2 italic transition-opacity duration-500 ${uiVisibilityClass}`}>
                <h1 className="text-2xl sm:text-3xl font-black tracking-widest uppercase flex items-center gap-2">
                    <FastForward className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
                    Neon Drive
                </h1>
            </div>
            
            {/* Bouton Toggle UI */}
            <button 
              onClick={() => setIsUIHidden(!isUIHidden)}
              className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all z-50 pointer-events-auto"
              title={isUIHidden ? "Afficher l'interface" : "Masquer l'interface"}
            >
               {isUIHidden ? (
                 <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-pulse" />
               ) : (
                 <EyeOff className="w-6 h-6 sm:w-8 sm:h-8" />
               )}
            </button>
        </div>

        {/* Zone Centrale (Tabs & Contenu) */}
        {!audioFile && (
          <div className="w-full max-w-5xl mx-auto mt-8 pointer-events-auto">
            <div className={`flex justify-center mb-8 flex-wrap gap-2 transition-opacity duration-500 ${uiVisibilityClass}`}>
              <button 
                onClick={() => switchTab('local')}
                className={`px-6 py-3 rounded-full text-lg font-bold transition-colors flex items-center gap-2 
                  ${activeTab === 'local' ? 'bg-cyan-500 text-black' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
              >
                <Upload className="w-5 h-5" /> Fichier
              </button>
              <button 
                onClick={() => switchTab('mic')}
                className={`px-6 py-3 rounded-full text-lg font-bold transition-colors flex items-center gap-2 
                  ${activeTab === 'mic' ? 'bg-rose-500 text-black' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
              >
                <Mic className="w-5 h-5" /> Micro
              </button>
              <button 
                onClick={() => switchTab('spotify')}
                className={`px-6 py-3 rounded-full text-lg font-bold transition-colors flex items-center gap-2 
                  ${activeTab === 'spotify' ? 'bg-green-500 text-black' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
              >
                <Globe className="w-5 h-5" /> Spotify
              </button>
            </div>
            
            {activeTab === 'local' && <LocalDropZoneUI />}
            {activeTab === 'mic' && <MicrophoneUI />}
            {activeTab === 'spotify' && <SpotifyConnectUI />}
          </div>
        )}

        {/* Lecteur Audio (Barre masquée si pas de fichier) */}
        <div 
            className={`
                transition-all duration-500 transform 
                ${audioFile ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'} 
                ${isHidden ? 'opacity-0 translate-y-20' : ''}
            `}
        >
          <div className={`max-w-4xl mx-auto bg-black/80 border border-white/20 p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 rounded-xl sm:rounded-full backdrop-blur pointer-events-auto transition-opacity duration-500 ${uiVisibilityClass}`}>
            <button 
              onClick={togglePlayFile}
              className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-white text-black hover:bg-cyan-400 transition-all rounded-full flex-shrink-0"
            >
              {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6 ml-1 fill-current" />}
            </button>

            <div className="flex-1 w-full text-center sm:text-left">
                <div className="text-white font-bold text-lg sm:text-xl truncate">{audioFile?.name}</div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 w-full sm:w-auto">
              <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
              <input 
                type="range" min="0" max="1" step="0.01" value={volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  if(audioRef.current) audioRef.current.volume = v;
                }}
                className="flex-1 sm:w-32 h-1 bg-gray-600 appearance-none cursor-pointer accent-cyan-400 rounded-lg"
              />
            </div>
            
            <button onClick={() => switchTab('local')} className="p-2 sm:p-3 text-white hover:text-cyan-400 transition-colors flex-shrink-0">
                <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>

      <audio ref={audioRef} src={audioFile?.url} crossOrigin="anonymous" onEnded={() => setIsPlaying(false)} />
    </div>
  );
};

export default AudioUploader;