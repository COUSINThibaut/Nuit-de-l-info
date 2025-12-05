import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStudents } from '@/contexts/StudentContext';
import { SkillCloud } from '@/components/SkillCloud';
import { ProfileCard } from '@/components/ProfileCard';
import { Sparkles, TrendingUp, Users, ArrowRight } from 'lucide-react';

/**
 * Page d'accueil avec SkillCloud et aperçu des talents vérifiés
 */
export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { students } = useStudents();

  // Récupérer les talents vérifiés
  const verifiedTalents = students.filter(s => s.isVerified).slice(0, 6);
  const recentTalents = [...students]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 3);

  return (
    <div className="space-y-12 md:space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-background to-background text-white rounded-2xl shadow-2xl border border-primary-900/50">
        <div className="relative z-10 px-6 md:px-12 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-primary-500 animate-pulse" size={28} />
              <span className="text-primary-400 font-semibold text-sm uppercase tracking-wide">
                Bienvenue sur la plateforme
              </span>
            </div>
            <h1 className="font-display font-bold text-4xl md:text-6xl mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-primary-200">
              Découvrez les Talents de Demain
            </h1>
            <p className="text-lg md:text-xl text-text-muted mb-8 leading-relaxed">
              Connectez-vous avec des étudiants talentueux, explorez leurs compétences 
              et trouvez le collaborateur idéal pour vos projets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/search"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-500 transition shadow-lg hover:shadow-primary-600/30"
              >
                Rechercher des talents
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/add"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-surface text-white rounded-lg font-semibold hover:bg-surface-light transition border border-white/10"
              >
                Créer mon profil
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <div className="absolute top-10 right-10 w-72 h-72 bg-primary-600 rounded-full blur-[100px] animate-pulse-slow"></div>
          <div className="absolute bottom-10 right-32 w-96 h-96 bg-secondary-600 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>
      </section>

      {/* Statistiques */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-white/5 p-6 rounded-xl shadow-lg hover:border-primary-500/30 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-900/30 rounded-lg group-hover:bg-primary-600 transition-colors">
              <Users className="text-primary-500 group-hover:text-white transition-colors" size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{students.length}</div>
              <div className="text-text-muted font-medium">Talents inscrits</div>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-white/5 p-6 rounded-xl shadow-lg hover:border-accent-500/30 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent-900/30 rounded-lg group-hover:bg-accent-600 transition-colors">
              <Sparkles className="text-accent-500 group-hover:text-white transition-colors" size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">
                {students.filter(s => s.isVerified).length}
              </div>
              <div className="text-text-muted font-medium">Talents vérifiés</div>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-white/5 p-6 rounded-xl shadow-lg hover:border-secondary-500/30 transition-colors group">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary-900/30 rounded-lg group-hover:bg-secondary-600 transition-colors">
              <TrendingUp className="text-secondary-500 group-hover:text-white transition-colors" size={24} />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">
                {new Set(students.flatMap(s => s.skills)).size}
              </div>
              <div className="text-text-muted font-medium">Compétences uniques</div>
            </div>
          </div>
        </div>
      </section>

      {/* Nuage de compétences */}
      <section>
        <SkillCloud maxSkills={50} />
      </section>

      {/* Talents vérifiés */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-display font-bold text-text flex items-center gap-3">
              <Sparkles className="text-accent-500" size={32} />
              Talents Vérifiés
            </h2>
            <p className="text-text-muted mt-2">
              Des étudiants dont les compétences ont été validées
            </p>
          </div>
          <Link
            to="/talents"
            className="hidden md:flex items-center gap-2 text-primary-500 hover:text-primary-400 font-semibold transition"
          >
            Voir tous les talents
            <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {verifiedTalents.map(student => (
            <ProfileCard 
              key={student.id} 
              student={student} 
              onClick={() => navigate(`/profile/${student.id}`)}
            />
          ))}
        </div>

        <Link
          to="/talents"
          className="md:hidden flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-500 transition mx-auto w-full sm:w-auto"
        >
          Voir tous les talents
          <ArrowRight size={20} />
        </Link>
      </section>

      {/* Derniers profils */}
      <section className="space-y-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-text flex items-center gap-3">
            <TrendingUp className="text-secondary-500" size={32} />
            Derniers Profils
          </h2>
          <p className="text-text-muted mt-2">
            Les talents récemment rejoints la plateforme
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentTalents.map(student => (
            <ProfileCard 
              key={student.id} 
              student={student} 
              onClick={() => navigate(`/profile/${student.id}`)}
            />
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="bg-gradient-to-r from-primary-900 to-secondary-900 text-white rounded-2xl p-8 md:p-12 text-center shadow-2xl border border-white/10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="relative z-10">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-primary-200">
            Prêt à Collaborer ?
          </h2>
          <p className="text-lg text-text-muted mb-8 max-w-2xl mx-auto">
            Rejoignez notre communauté de talents et trouvez votre prochain collaborateur
          </p>
          <Link
            to="/add"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-background rounded-lg font-semibold hover:bg-gray-200 transition shadow-lg hover:shadow-white/20"
          >
            Créer mon profil maintenant
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};
