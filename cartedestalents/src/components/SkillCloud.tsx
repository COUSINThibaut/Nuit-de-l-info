import React, { useMemo, useState } from 'react';
import { useStudents } from '@/contexts/StudentContext';
import { TrendingUp } from 'lucide-react';

interface SkillCloudProps {
  onSkillClick?: (skill: string) => void;
  maxSkills?: number;
}

/**
 * Composant SkillCloud - Nuage de compétences pondéré dynamique
 * La taille des tags est proportionnelle au nombre d'étudiants possédant la compétence
 * Optimisé avec useMemo pour les performances
 */
export const SkillCloud: React.FC<SkillCloudProps> = ({ 
  onSkillClick, 
  maxSkills = 40 
}) => {
  const { getSkillStatistics, searchStudents } = useStudents();
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  /**
   * Calcul des statistiques des compétences avec useMemo
   * Évite les recalculs inutiles
   */
  const skillStats = useMemo(() => {
    return getSkillStatistics().slice(0, maxSkills);
  }, [getSkillStatistics, maxSkills]);

  /**
   * Calcul des tailles de police proportionnelles
   * Min: 0.75rem (12px), Max: 2.5rem (40px)
   */
  const calculateFontSize = useMemo(() => {
    if (skillStats.length === 0) return () => '1rem';

    const maxCount = Math.max(...skillStats.map(s => s.count));
    const minCount = Math.min(...skillStats.map(s => s.count));
    const range = maxCount - minCount || 1;

    return (count: number): string => {
      // Échelle logarithmique pour une meilleure distribution
      const normalized = (count - minCount) / range;
      const logScale = Math.log(normalized * 9 + 1) / Math.log(10); // log10(x*9 + 1)
      
      const minSize = 0.75; // 12px
      const maxSize = 2.5;  // 40px
      const size = minSize + (logScale * (maxSize - minSize));
      
      return `${size}rem`;
    };
  }, [skillStats]);

  /**
   * Calcul de l'opacité basée sur la popularité
   */
  const calculateOpacity = (count: number): number => {
    const maxCount = Math.max(...skillStats.map(s => s.count));
    const minOpacity = 0.6;
    const maxOpacity = 1;
    const normalized = count / maxCount;
    
    return minOpacity + (normalized * (maxOpacity - minOpacity));
  };

  /**
   * Palette de couleurs dynamique
   */
  const getSkillColor = (index: number): string => {
    const colors = [
      'text-primary-500 hover:text-primary-400',
      'text-secondary-500 hover:text-secondary-400',
      'text-accent-500 hover:text-accent-400',
      'text-white hover:text-primary-200',
      'text-primary-400 hover:text-primary-300',
      'text-secondary-400 hover:text-secondary-300',
    ];
    
    return colors[index % colors.length];
  };

  /**
   * Gestion du clic sur une compétence
   */
  const handleSkillClick = (skill: string) => {
    setSelectedSkill(selectedSkill === skill ? null : skill);
    if (onSkillClick) {
      onSkillClick(skill);
    }
  };

  /**
   * Comptage des étudiants ayant la compétence sélectionnée
   */
  const studentsWithSkill = useMemo(() => {
    if (!selectedSkill) return 0;
    return searchStudents({ 
      keyword: '', 
      skills: [selectedSkill], 
      languages: [], 
      fields: [] 
    }).length;
  }, [selectedSkill, searchStudents]);

  if (skillStats.length === 0) {
    return (
      <div className="bg-surface rounded-lg shadow-lg p-8 text-center border border-white/5">
        <p className="text-text-muted">Aucune compétence disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-surface/50 backdrop-blur-sm rounded-lg shadow-2xl p-6 md:p-8 animate-fade-in border border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/10 to-secondary-900/10 pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-primary-500" size={24} />
          <h2 className="text-2xl font-display font-bold text-text">
            Nuage de Compétences
          </h2>
        </div>
        <div className="text-sm text-text-muted bg-surface px-4 py-2 rounded-full shadow-sm border border-white/5">
          {skillStats.length} compétences
        </div>
      </div>

      {/* Info sur la compétence sélectionnée */}
      {selectedSkill && (
        <div className="mb-6 p-4 bg-primary-900/20 border-l-4 border-primary-500 rounded-lg animate-slide-up relative z-10">
          <p className="text-primary-100 font-semibold">
            {studentsWithSkill} étudiant{studentsWithSkill > 1 ? 's' : ''} maîtrise{studentsWithSkill > 1 ? 'nt' : ''} <span className="text-white">{selectedSkill}</span>
          </p>
        </div>
      )}

      {/* Nuage de compétences */}
      <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4 min-h-[300px] py-4">
        {skillStats.map((stat, index) => {
          const fontSize = calculateFontSize(stat.count);
          const opacity = calculateOpacity(stat.count);
          const isSelected = selectedSkill === stat.skill;
          const isHovered = hoveredSkill === stat.skill;

          return (
            <button
              key={stat.skill}
              onClick={() => handleSkillClick(stat.skill)}
              onMouseEnter={() => setHoveredSkill(stat.skill)}
              onMouseLeave={() => setHoveredSkill(null)}
              className={`
                font-semibold transition-all duration-300 ease-out
                ${getSkillColor(index)}
                ${isSelected ? 'scale-110 drop-shadow-lg' : 'hover:scale-105'}
                ${isHovered ? 'drop-shadow-md' : ''}
                cursor-pointer
                relative
                group
              `}
              style={{
                fontSize,
                opacity: isSelected ? 1 : opacity,
                fontWeight: isSelected ? 700 : 600,
              }}
            >
              {stat.skill}
              
              {/* Tooltip au survol */}
              {isHovered && (
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1.5 bg-neutral-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {stat.count} étudiant{stat.count > 1 ? 's' : ''} • {stat.percentage.toFixed(0)}%
                  <span className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-neutral-900"></span>
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Légende */}
      <div className="mt-6 pt-6 border-t border-neutral-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-600">
          <p className="flex items-center gap-2">
            <span className="inline-block w-3 h-3 bg-primary-600 rounded-full"></span>
            Plus la compétence est grande, plus elle est populaire
          </p>
          <p className="italic">
            Cliquez sur une compétence pour filtrer les étudiants
          </p>
        </div>
      </div>

      {/* Statistiques supplémentaires */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {skillStats.slice(0, 4).map((stat) => (
          <div 
            key={stat.skill}
            className="bg-surface/50 backdrop-blur-sm border border-white/5 p-4 rounded-lg shadow-lg hover:shadow-primary-500/20 hover:border-primary-500/30 transition cursor-pointer group"
            onClick={() => handleSkillClick(stat.skill)}
          >
            <div className="text-2xl font-bold text-text group-hover:text-primary-400 transition">
              {stat.count}
            </div>
            <div className="text-sm text-text-muted mt-1 truncate group-hover:text-text transition">
              {stat.skill}
            </div>
            <div className="text-xs text-text-muted/70 mt-1">
              {stat.percentage.toFixed(1)}% des étudiants
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
