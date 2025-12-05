import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '@/contexts/StudentContext';
import { ProfileCard } from '@/components/ProfileCard';
import { SearchFilters } from '@/components/SearchFilters';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { Search as SearchIcon, Users, Filter } from 'lucide-react';

/**
 * Page de recherche avec filtres avancés
 */
export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { searchStudents } = useStudents();
  const { filters } = useSearchFilters();
  const [searchKeyword, setSearchKeyword] = useState('');

  /**
   * Recherche optimisée avec useMemo
   */
  const filteredStudents = useMemo(() => {
    return searchStudents({
      ...filters,
      keyword: searchKeyword,
    });
  }, [searchStudents, filters, searchKeyword]);

  /**
   * Callback optimisé pour la recherche
   */
  const handleSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-secondary-900 text-white rounded-xl p-6 md:p-8 shadow-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <SearchIcon size={32} className="text-primary-500" />
            <h1 className="font-display font-bold text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white to-primary-200">
              Trouver un Collaborateur
            </h1>
          </div>
          <p className="text-text-muted text-lg">
            Utilisez les filtres ci-dessous pour trouver le talent parfait pour votre projet
          </p>
        </div>
      </div>

      {/* Filtres de recherche */}
      <SearchFilters onSearch={handleSearch} />

      {/* Résultats */}
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-surface rounded-lg shadow-lg p-4 border border-white/5">
          <div className="flex items-center gap-3">
            <Filter className="text-primary-500" size={24} />
            <div>
              <h2 className="font-display font-bold text-xl text-text">
                Résultats de recherche
              </h2>
              <p className="text-text-muted text-sm">
                {filteredStudents.length} talent{filteredStudents.length > 1 ? 's' : ''} trouvé{filteredStudents.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-text-muted">
            <Users size={20} />
            <span className="font-semibold text-lg text-white">{filteredStudents.length}</span>
          </div>
        </div>

        {/* Grille de résultats */}
        {filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map(student => (
              <ProfileCard 
                key={student.id} 
                student={student} 
                onClick={() => navigate(`/profile/${student.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-surface rounded-lg shadow-lg p-12 text-center border border-white/5">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-background rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
                <SearchIcon className="text-text-muted" size={48} />
              </div>
              <h3 className="font-display font-bold text-2xl text-text mb-3">
                Aucun résultat trouvé
              </h3>
              <p className="text-text-muted mb-6">
                Essayez de modifier vos critères de recherche ou de supprimer certains filtres
              </p>
              <button
                onClick={() => {
                  setSearchKeyword('');
                  // Reset filters would be called here
                }}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-500 transition shadow-lg hover:shadow-primary-600/30"
              >
                Réinitialiser les filtres
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions si peu de résultats */}
      {filteredStudents.length > 0 && filteredStudents.length < 3 && (
        <div className="bg-accent-50 border-l-4 border-accent-600 rounded-lg p-6">
          <h3 className="font-semibold text-accent-900 mb-2">
            💡 Conseil de recherche
          </h3>
          <p className="text-accent-800">
            Peu de résultats ? Essayez d'élargir votre recherche en retirant certains filtres 
            ou en utilisant des termes plus généraux.
          </p>
        </div>
      )}
    </div>
  );
};
