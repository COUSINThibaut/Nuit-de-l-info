import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '@/contexts/StudentContext';
import { ProfileCard } from '@/components/ProfileCard';
import { Users, CheckCircle, Award } from 'lucide-react';

/**
 * Page listant tous les talents avec tri
 */
export const TalentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { students } = useStudents();
  const [sortBy, setSortBy] = React.useState<'name' | 'field' | 'year' | 'verified'>('name');
  const [filterVerified, setFilterVerified] = React.useState(false);

  /**
   * Tri et filtrage des étudiants
   */
  const sortedStudents = React.useMemo(() => {
    let filtered = filterVerified ? students.filter(s => s.isVerified) : students;

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'field':
          return a.field.localeCompare(b.field);
        case 'year':
          return b.year - a.year;
        case 'verified':
          return Number(b.isVerified) - Number(a.isVerified);
        default:
          return 0;
      }
    });
  }, [students, sortBy, filterVerified]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary-900 to-primary-900 text-white rounded-xl p-6 md:p-8 shadow-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Users size={32} className="text-primary-500" />
            <h1 className="font-display font-bold text-3xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white to-primary-200">
              Tous les Talents
            </h1>
          </div>
          <p className="text-text-muted text-lg">
            Découvrez l'ensemble de notre communauté de talents
          </p>
        </div>
      </div>

      {/* Filtres et tri */}
      <div className="bg-surface rounded-lg shadow-lg p-4 md:p-6 border border-white/5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filterVerified}
                onChange={(e) => setFilterVerified(e.target.checked)}
                className="w-5 h-5 text-accent-600 rounded focus:ring-2 focus:ring-accent-500 bg-background border-white/10"
              />
              <span className="flex items-center gap-2 font-medium text-text group-hover:text-primary-500 transition">
                <CheckCircle size={18} className="text-accent-500" />
                Talents vérifiés uniquement
              </span>
            </label>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text-muted">Trier par:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 bg-background border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-text"
            >
              <option value="name">Nom (A-Z)</option>
              <option value="field">Filière</option>
              <option value="year">Année d'études</option>
              <option value="verified">Statut vérifié</option>
            </select>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-muted">
              Affichage de <span className="font-semibold text-text">{sortedStudents.length}</span> talent{sortedStudents.length > 1 ? 's' : ''}
            </span>
            <span className="text-text-muted">
              <span className="font-semibold text-success-400">{students.filter(s => s.isVerified).length}</span> vérifié{students.filter(s => s.isVerified).length > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface/50 backdrop-blur-sm border border-white/5 p-4 rounded-lg shadow-lg text-center">
          <div className="text-2xl font-bold text-primary-400">{students.length}</div>
          <div className="text-sm text-text-muted mt-1">Total</div>
        </div>
        <div className="bg-surface/50 backdrop-blur-sm border border-white/5 p-4 rounded-lg shadow-lg text-center">
          <div className="text-2xl font-bold text-success-400">
            {students.filter(s => s.isVerified).length}
          </div>
          <div className="text-sm text-text-muted mt-1">Vérifiés</div>
        </div>
        <div className="bg-surface/50 backdrop-blur-sm border border-white/5 p-4 rounded-lg shadow-lg text-center">
          <div className="text-2xl font-bold text-secondary-400">
            {new Set(students.map(s => s.field)).size}
          </div>
          <div className="text-sm text-text-muted mt-1">Filières</div>
        </div>
        <div className="bg-surface/50 backdrop-blur-sm border border-white/5 p-4 rounded-lg shadow-lg text-center">
          <div className="text-2xl font-bold text-accent-400">
            {new Set(students.flatMap(s => s.skills)).size}
          </div>
          <div className="text-sm text-text-muted mt-1">Compétences</div>
        </div>
      </div>

      {/* Grille de talents */}
      {sortedStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedStudents.map(student => (
            <ProfileCard 
              key={student.id} 
              student={student} 
              onClick={() => navigate(`/profile/${student.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-surface/50 backdrop-blur-sm border border-white/5 rounded-lg shadow-lg p-12 text-center">
          <Award className="mx-auto text-text-muted/30 mb-4" size={64} />
          <h3 className="font-display font-bold text-2xl text-text mb-3">
            Aucun talent vérifié
          </h3>
          <p className="text-text-muted">
            Désactivez le filtre pour voir tous les talents
          </p>
        </div>
      )}
    </div>
  );
};
