import React, { useMemo } from 'react';
import { Search, X, Filter, CheckCircle } from 'lucide-react';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { allSkills, allLanguages, availableFields } from '@/services/data';

interface SearchFiltersProps {
  onSearch: (keyword: string) => void;
  onSkillClick?: (skill: string) => void;
}

/**
 * Composant de filtres de recherche avancés avec optimisation useMemo
 */
export const SearchFilters: React.FC<SearchFiltersProps> = ({ onSearch, onSkillClick }) => {
  const {
    filters,
    updateKeyword,
    toggleSkill,
    toggleLanguage,
    toggleField,
    setVerifiedFilter,
    resetFilters,
    hasActiveFilters,
  } = useSearchFilters();

  const [showAdvanced, setShowAdvanced] = React.useState(false);

  /**
   * Filtres populaires basés sur les compétences les plus courantes
   * Optimisé avec useMemo pour éviter les recalculs
   */
  const popularSkills = useMemo(() => {
    return allSkills.slice(0, 12); // Top 12 compétences
  }, []);

  /**
   * Gestion de la recherche par mot-clé
   */
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;
    updateKeyword(keyword);
    onSearch(keyword);
  };

  /**
   * Gestion du clic sur une compétence
   */
  const handleSkillClick = (skill: string) => {
    toggleSkill(skill);
    if (onSkillClick) {
      onSkillClick(skill);
    }
  };

  return (
    <div className="bg-surface rounded-lg shadow-lg p-4 md:p-6 space-y-4 animate-fade-in border border-white/5">
      {/* Barre de recherche principale */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
        <input
          type="text"
          value={filters.keyword}
          onChange={handleKeywordChange}
          placeholder="Rechercher par nom, compétence, filière..."
          className="w-full pl-10 pr-4 py-3 bg-background border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-base text-text placeholder-text-muted"
        />
        {filters.keyword && (
          <button
            onClick={() => {
              updateKeyword('');
              onSearch('');
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-white transition"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Toggle filtres avancés */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-primary-500 hover:text-primary-400 font-medium transition"
        >
          <Filter size={18} />
          {showAdvanced ? 'Masquer' : 'Afficher'} les filtres avancés
        </button>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 text-sm text-text-muted hover:text-white transition"
          >
            <X size={16} />
            Réinitialiser
          </button>
        )}
      </div>

      {/* Compétences populaires (toujours visibles) */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-text-muted">Compétences populaires</h4>
        <div className="flex flex-wrap gap-2">
          {popularSkills.map(skill => (
            <button
              key={skill}
              onClick={() => handleSkillClick(skill)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition transform hover:scale-105 ${
                filters.skills.includes(skill)
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-surface-light text-text-muted hover:bg-white/10 border border-white/5'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Filtres avancés */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-white/10 animate-slide-up">
          {/* Filtre par filière */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-text-muted">Filières</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableFields.slice(0, 9).map(field => (
                <button
                  key={field}
                  onClick={() => toggleField(field)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition text-left ${
                    filters.fields.includes(field)
                      ? 'bg-secondary-900/30 text-secondary-400 border border-secondary-500'
                      : 'bg-background text-text-muted hover:bg-white/5 border border-white/5'
                  }`}
                >
                  {field}
                </button>
              ))}
            </div>
          </div>

          {/* Filtre par langues */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-text-muted">Langues</h4>
            <div className="flex flex-wrap gap-2">
              {allLanguages.slice(0, 8).map(language => (
                <button
                  key={language}
                  onClick={() => toggleLanguage(language)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    filters.languages.includes(language)
                      ? 'bg-accent-600 text-white'
                      : 'bg-surface-light text-text-muted hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
          </div>

          {/* Filtre par statut de vérification */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-text-muted">Statut</h4>
            <div className="flex gap-3">
              <button
                onClick={() => setVerifiedFilter(filters.isVerified === undefined ? true : undefined)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filters.isVerified === true
                    ? 'bg-accent-900/30 text-accent-400 border border-accent-500'
                    : 'bg-background text-text-muted hover:bg-white/5 border border-white/5'
                }`}
              >
                <CheckCircle size={16} />
                Talents vérifiés uniquement
              </button>
            </div>
          </div>

          {/* Filtre par année d'études */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-text-muted">Année d'études</h4>
            <div className="flex gap-2 items-center">
              <span className="text-sm text-text-muted">De</span>
              <select
                value={filters.minYear || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : undefined;
                  const { maxYear } = filters;
                  if (value !== undefined) {
                    if (maxYear !== undefined && value > maxYear) {
                      return;
                    }
                  }
                }}
                className="px-3 py-2 bg-background border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm text-text"
              >
                <option value="">Toutes</option>
                {[1, 2, 3, 4, 5, 6].map(year => (
                  <option key={year} value={year}>Année {year}</option>
                ))}
              </select>
              <span className="text-sm text-neutral-600">à</span>
              <select
                value={filters.maxYear || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : undefined;
                  const { minYear } = filters;
                  if (value !== undefined && minYear !== undefined && value < minYear) {
                    return;
                  }
                }}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">Toutes</option>
                {[1, 2, 3, 4, 5, 6].map(year => (
                  <option key={year} value={year}>Année {year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Résumé des filtres actifs */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-neutral-200">
          <div className="flex flex-wrap gap-2">
            {filters.skills.map(skill => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
              >
                {skill}
                <button onClick={() => toggleSkill(skill)} className="hover:text-primary-900">
                  <X size={14} />
                </button>
              </span>
            ))}
            {filters.languages.map(lang => (
              <span
                key={lang}
                className="inline-flex items-center gap-1 px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-sm"
              >
                {lang}
                <button onClick={() => toggleLanguage(lang)} className="hover:text-accent-900">
                  <X size={14} />
                </button>
              </span>
            ))}
            {filters.fields.map(field => (
              <span
                key={field}
                className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-800 text-secondary-200 border border-white/10 rounded-full text-sm"
              >
                {field}
                <button onClick={() => toggleField(field)} className="hover:text-white transition">
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
