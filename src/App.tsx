import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Wallet, Shield, RotateCcw, Info, Play, Trophy, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

// --- TYPES ---

interface Impact {
  budget: number;
  eco: number;
  indep: number;
}

interface Choice {
  text: string;
  impact: Impact;
  feedback: string;
}

interface Scenario {
  id: number;
  title: string;
  description: string;
  choices: {
    left: Choice;
    right: Choice;
  };
}

interface GameStats {
  budget: number;
  eco: number;
  indep: number;
}

// --- DATA ---

const scenarios: Scenario[] = [
  {
    id: 1,
    title: "L'Obsolescence de Windows 10",
    description: "Le support s'arrête bientôt. Vos 200 PC fonctionnent encore bien, mais ils ne sont pas compatibles Windows 11.",
    choices: {
      left: {
        text: "Tout jeter et racheter",
        impact: { budget: -50, eco: -50, indep: -10 },
        feedback: "Désastre écologique ! Des tonnes de déchets, mais Microsoft est content."
      },
      right: {
        text: "Passer sous Linux (Mint)",
        impact: { budget: +10, eco: +20, indep: +30 },
        feedback: "Excellente décision ! Matériel sauvé, argent économisé et indépendance gagnée."
      }
    }
  },
  {
    id: 2,
    title: "Le Cloud Scolaire",
    description: "Un commercial insistant vous propose 'EduCloud', hébergé en Californie, gratuit la première année.",
    choices: {
      left: {
        text: "Signer le contrat",
        impact: { budget: -10, eco: 0, indep: -40 },
        feedback: "Vos données partent hors UE. Vous êtes désormais captif de leur écosystème."
      },
      right: {
        text: "Utiliser la Forge (Apps Edu)",
        impact: { budget: +10, eco: +5, indep: +20 },
        feedback: "Souverain, RGPD-friendly et sécurisé. L'État propose déjà ces outils !"
      }
    }
  },
  {
    id: 3,
    title: "Le Vieux Matériel",
    description: "Des élèves motivés demandent à récupérer les vieux ordinateurs du CDI destinés à la benne.",
    choices: {
      left: {
        text: "Refuser (Sécurité)",
        impact: { budget: 0, eco: -10, indep: -5 },
        feedback: "Une occasion manquée d'apprendre et de réduire les déchets."
      },
      right: {
        text: "Créer un 'Repair Café'",
        impact: { budget: +5, eco: +15, indep: +15 },
        feedback: "L'autonomie technologique commence par la compréhension du matériel !"
      }
    }
  },
  {
    id: 4,
    title: "Panne de Projecteur",
    description: "Le vidéoprojecteur de la salle de sciences a lâché. Le modèle ne se fait plus.",
    choices: {
      left: {
        text: "Acheter un écran 4K neuf",
        impact: { budget: -30, eco: -20, indep: 0 },
        feedback: "Cher et énergivore. Était-ce vraiment nécessaire ?"
      },
      right: {
        text: "Réparer (Changer condo)",
        impact: { budget: +5, eco: +10, indep: +10 },
        feedback: "Un coup de fer à souder et c'est reparti pour 5 ans !"
      }
    }
  },
  {
    id: 5,
    title: "Licences Bureautiques",
    description: "L'abonnement annuel à la suite bureautique propriétaire arrive à échéance. Le prix a augmenté de 20%.",
    choices: {
      left: {
        text: "Payer (Pas le choix)",
        impact: { budget: -20, eco: 0, indep: -20 },
        feedback: "Le budget sorties scolaires va en pâtir..."
      },
      right: {
        text: "Former à LibreOffice",
        impact: { budget: +20, eco: 0, indep: +25 },
        feedback: "Un petit effort de formation pour une liberté totale et définitive."
      }
    }
  }
];

// --- COMPONENTS ---

const StatBar = ({ icon: Icon, value, color, label }: { icon: any, value: number, color: string, label: string }) => (
  <div className="flex flex-col items-center w-1/3 gap-1">
    <Icon size={24} className={color} />
    <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden relative">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ type: "spring", stiffness: 50 }}
        className={clsx("h-full absolute left-0 top-0", color.replace('text-', 'bg-'))}
      />
    </div>
    <span className="text-xs text-slate-300 font-medium tracking-wide">{label}</span>
  </div>
);

export default function App() {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [stats, setStats] = useState<GameStats>({ budget: 50, eco: 50, indep: 50 });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [lastChoice, setLastChoice] = useState<'left' | 'right' | null>(null);

  const currentCard = scenarios[index];

  const handleChoice = (direction: 'left' | 'right') => {
    const choice = direction === 'left' ? currentCard.choices.left : currentCard.choices.right;
    setLastChoice(direction);
    
    // Update stats with clamping
    setStats(prev => ({
      budget: Math.min(100, Math.max(0, prev.budget + choice.impact.budget)),
      eco: Math.min(100, Math.max(0, prev.eco + choice.impact.eco)),
      indep: Math.min(100, Math.max(0, prev.indep + choice.impact.indep))
    }));

    setFeedback(choice.feedback);
  };

  const nextCard = () => {
    setFeedback(null);
    setLastChoice(null);
    if (index + 1 < scenarios.length) {
      setIndex(index + 1);
    } else {
      setGameOver(true);
    }
  };

  const resetGame = () => {
    setIndex(0);
    setStats({ budget: 50, eco: 50, indep: 50 });
    setGameOver(false);
    setFeedback(null);
    setLastChoice(null);
    setStarted(false);
  };

  // --- RENDERING ---

  if (!started) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="mb-8 flex justify-center">
            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield size={48} className="text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
            Village Numérique Résistant
          </h1>
          <p className="text-slate-400 mb-8 text-lg leading-relaxed">
            Face à l'Empire du Big Tech, saurez-vous gérer votre établissement scolaire avec <span className="text-blue-400 font-bold">Autonomie</span>, <span className="text-green-400 font-bold">Écologie</span> et <span className="text-yellow-400 font-bold">Budget</span> ?
          </p>
          <button 
            onClick={() => setStarted(true)}
            className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white transition-all duration-200 bg-blue-600 font-lg rounded-full hover:bg-blue-500 hover:scale-105 focus:outline-none ring-offset-2 focus:ring-2 ring-blue-400"
          >
            <Play className="mr-2 fill-current" size={20} />
            Commencer la Mission
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      
      {/* HEADER / HUD */}
      <div className="w-full max-w-md bg-slate-800 p-5 rounded-2xl shadow-xl shadow-slate-950/50 mb-8 flex justify-between gap-4 border border-slate-700/50">
        <StatBar icon={Wallet} value={stats.budget} color="text-yellow-400" label="Budget" />
        <StatBar icon={Leaf} value={stats.eco} color="text-green-400" label="Écologie" />
        <StatBar icon={Shield} value={stats.indep} color="text-blue-400" label="Liberté" />
      </div>

      {/* ZONE DE JEU */}
      <div className="relative w-full max-w-md h-[500px] perspective-1000">
        <AnimatePresence mode='wait'>
          {!gameOver && !feedback && (
            <motion.div
              key="card"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-white rounded-3xl shadow-2xl p-6 flex flex-col justify-between items-center text-center border-[6px] border-slate-200 overflow-hidden"
            >
              <div className="w-full">
                <div className="flex justify-between items-center mb-6">
                  <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold uppercase tracking-wider">
                    Dilemme {index + 1}/{scenarios.length}
                  </span>
                </div>
                
                <h2 className="text-2xl font-black text-slate-800 mb-4 leading-tight">{currentCard.title}</h2>
                <p className="text-slate-600 text-lg leading-relaxed">{currentCard.description}</p>
              </div>

              {/* Character Illustration Placeholder */}
              <div className="my-4 w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl">
                🧑‍🏫
              </div>

              <div className="w-full grid grid-cols-2 gap-4 mt-auto">
                <button 
                  onClick={() => handleChoice('left')}
                  className="p-4 bg-red-50 hover:bg-red-100 border-2 border-red-200 rounded-2xl text-red-700 font-bold transition-all active:scale-95 text-sm flex flex-col items-center justify-center h-24 shadow-sm hover:shadow-md"
                >
                  {currentCard.choices.left.text}
                </button>
                <button 
                  onClick={() => handleChoice('right')}
                  className="p-4 bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-200 rounded-2xl text-emerald-700 font-bold transition-all active:scale-95 text-sm flex flex-col items-center justify-center h-24 shadow-sm hover:shadow-md"
                >
                  {currentCard.choices.right.text}
                </button>
              </div>
            </motion.div>
          )}

          {/* FEEDBACK PÉDAGOGIQUE (Overlay) */}
          {feedback && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 bg-slate-800/95 rounded-3xl flex flex-col items-center justify-center p-8 text-center backdrop-blur-md z-20 border border-slate-600 shadow-2xl"
            >
              <div className={clsx("mb-6 p-4 rounded-full", lastChoice === 'right' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400")}>
                <Info size={48} />
              </div>
              <p className="text-xl font-medium text-white leading-relaxed mb-8">
                {feedback}
              </p>
              <button
                onClick={nextCard}
                className="px-8 py-3 bg-white text-slate-900 rounded-full font-bold hover:bg-slate-200 transition-colors shadow-lg"
              >
                Continuer
              </button>
            </motion.div>
          )}

          {/* FIN DU JEU */}
          {gameOver && (
            <motion.div
              key="end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 bg-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-slate-700"
            >
              <div className="mb-6 relative">
                 <Trophy size={64} className={stats.indep > 70 ? "text-yellow-400" : "text-slate-600"} />
                 {stats.indep <= 70 && <AlertTriangle size={32} className="text-red-500 absolute -bottom-2 -right-2 bg-slate-800 rounded-full" />}
              </div>
             
              <h2 className="text-3xl font-bold text-white mb-2">Bilan NIRD</h2>
              <p className="text-slate-400 mb-8 text-sm uppercase tracking-widest">Fin de l'année scolaire</p>
              
              <div className="space-y-4 mb-8 w-full bg-slate-900/50 p-6 rounded-xl">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-yellow-400 font-bold flex items-center gap-2"><Wallet size={16}/> Budget</span> 
                    <span className="text-white font-mono">{stats.budget}/100</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div style={{width: `${stats.budget}%`}} className="h-full bg-yellow-400"/>
                </div>

                <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-green-400 font-bold flex items-center gap-2"><Leaf size={16}/> Écologie</span> 
                    <span className="text-white font-mono">{stats.eco}/100</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div style={{width: `${stats.eco}%`}} className="h-full bg-green-400"/>
                </div>

                <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-blue-400 font-bold flex items-center gap-2"><Shield size={16}/> Liberté</span> 
                    <span className="text-white font-mono">{stats.indep}/100</span>
                </div>
                 <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div style={{width: `${stats.indep}%`}} className="h-full bg-blue-400"/>
                </div>
              </div>

              <div className={clsx("p-4 rounded-xl mb-6 text-sm italic border", stats.indep > 70 ? "bg-blue-900/30 border-blue-500/30 text-blue-200" : "bg-red-900/30 border-red-500/30 text-red-200")}>
                {stats.indep > 70 
                  ? "Bravo ! Votre établissement est un véritable modèle de résistance numérique !" 
                  : "C'est difficile... Votre établissement est encore très dépendant des GAFAM."}
              </div>

              <button 
                onClick={resetGame}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition-all shadow-lg hover:shadow-blue-500/25"
              >
                <RotateCcw size={20} /> Recommencer
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-12 text-slate-600 text-xs text-center max-w-md">
        <p className="font-semibold text-slate-500">Nuit de l'Info 2025</p>
        <p>Développé avec React, TypeScript & Tailwind</p>
        <p className="mt-2 opacity-50">Licence MIT - Code Open Source</p>
      </footer>
    </div>
  );
}