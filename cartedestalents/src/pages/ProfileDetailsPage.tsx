import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudents } from '@/contexts/StudentContext';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from '@/components/LoginModal';
import { 
  MapPin, 
  GraduationCap, 
  CheckCircle, 
  Mail, 
  Github, 
  Linkedin, 
  Globe,
  ArrowLeft,
  Share2,
  Check
} from 'lucide-react';

const formatUrl = (url: string) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

export const ProfileDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getStudentById } = useStudents();
  const { isAuthenticated, token } = useAuth();
  const student = getStudentById(id || '');
  const [requestSent, setRequestSent] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const checkStatus = async () => {
      if (isAuthenticated && student?.id) {
        try {
          const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3023/api');
          const response = await fetch(`${API_URL}/connections/status/${student.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'pending' || data.status === 'accepted') {
              setRequestSent(true);
            }
          }
        } catch (error) {
          console.error("Error checking connection status:", error);
        }
      }
    };
    checkStatus();
  }, [isAuthenticated, student, token]);

  const handleContact = async () => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    if (!student) return;

    try {
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3023/api');
      const response = await fetch(`${API_URL}/connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ toUserId: student.id }) 
      });

      if (response.ok) {
        setRequestSent(true);
      } else {
        alert("Erreur lors de l'envoi de la demande.");
      }
    } catch (error) {
      console.error("Error sending request:", error);
      alert("Erreur lors de l'envoi de la demande.");
    }
  };

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold text-text mb-4">Profil introuvable</h2>
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <ArrowLeft size={20} />
          Retour
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Bouton Retour */}
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-muted hover:text-primary-500 transition group"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        Retour aux résultats
      </button>

      {/* En-tête Profil */}
      <div className="bg-surface rounded-2xl shadow-2xl border border-white/5 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-900 to-secondary-900 relative">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>
        
        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 mb-6">
            <div className="relative">
              <img 
                src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=BA181B&color=fff&size=128`}
                alt={student.name}
                className="w-32 h-32 rounded-full object-cover border-4 border-surface shadow-xl"
              />
              {student.isVerified && (
                <div className="absolute bottom-1 right-1 bg-accent-500 rounded-full p-1.5 shadow-lg border-2 border-surface">
                  <CheckCircle size={24} className="text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0 pt-2 md:pt-0">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-text mb-2">
                {student.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-text-muted">
                <div className="flex items-center gap-2">
                  <GraduationCap size={18} className="text-primary-500" />
                  <span>{student.field} • Année {student.year}</span>
                </div>
                {student.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={18} className="text-primary-500" />
                    <span>{student.location}</span>
                  </div>
                )}
                {student.availability && (
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${
                    student.availability === 'available' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    student.availability === 'open' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      student.availability === 'available' ? 'bg-green-400' :
                      student.availability === 'open' ? 'bg-yellow-400' :
                      'bg-red-400'
                    }`}></span>
                    {student.availability === 'available' ? 'Disponible pour projets' :
                     student.availability === 'open' ? 'Ouvert aux échanges' :
                     'Non disponible'}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-4 md:mt-0">
              <button 
                onClick={handleContact}
                disabled={requestSent}
                className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg transition
                  ${requestSent 
                    ? 'bg-green-500/20 text-green-400 cursor-default' 
                    : 'bg-primary-600 text-white hover:bg-primary-700 hover:shadow-primary-500/20'
                  }
                  ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {requestSent ? <Check size={20} /> : <Mail size={20} />}
                {requestSent ? 'Demande envoyée' : 'Contacter'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Colonne Gauche: Bio & Skills */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                  <span className="w-8 h-1 bg-primary-500 rounded-full"></span>
                  À propos
                </h2>
                <p className="text-text-muted leading-relaxed whitespace-pre-line break-words">
                  {student.bio}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                  <span className="w-8 h-1 bg-primary-500 rounded-full"></span>
                  Compétences
                </h2>
                <div className="flex flex-wrap gap-2">
                  {student.skills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1.5 bg-white/5 text-text rounded-lg border border-white/10 text-sm font-medium hover:border-primary-500/50 transition"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>

              {student.passions && student.passions.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                    <span className="w-8 h-1 bg-secondary-500 rounded-full"></span>
                    Passions
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {student.passions.map((passion, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1.5 bg-secondary-500/10 text-secondary-300 rounded-lg border border-secondary-500/20 text-sm font-medium"
                      >
                        {passion}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
                  <span className="w-8 h-1 bg-primary-500 rounded-full"></span>
                  Projets ({student.projects.length})
                </h2>
                <div className="space-y-4">
                  {student.projects.map((project, index) => (
                    <div key={index} className="bg-background/50 rounded-xl p-6 border border-white/5 hover:border-primary-500/30 transition group">
                      <div className="flex items-start gap-4">
                        {project.imageUrl && (
                          <img 
                            src={project.imageUrl} 
                            alt={project.title} 
                            className="w-24 h-24 object-cover rounded-lg border border-white/10"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-text group-hover:text-primary-500 transition">
                            {project.title}
                          </h3>
                          <p className="text-text-muted mt-2 text-sm leading-relaxed">
                            {project.description}
                          </p>
                          <div className="flex gap-4 mt-4">
                            {project.linkedinUrl && (
                              <a 
                                href={project.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition"
                              >
                                <Linkedin size={14} />
                                Post LinkedIn
                              </a>
                            )}
                            {project.githubUrl && (
                              <a 
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs font-medium text-text-muted hover:text-white transition"
                              >
                                <Github size={14} />
                                Repo GitHub
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {student.projects.length === 0 && (
                    <p className="text-text-muted italic">Aucun projet renseigné.</p>
                  )}
                </div>
              </section>
            </div>

            {/* Colonne Droite: Infos & Langues */}
            <div className="space-y-8">
              <div className="bg-background/50 rounded-xl p-6 border border-white/5">
                <h3 className="font-bold text-text mb-4 flex items-center gap-2">
                  <Share2 size={20} className="text-primary-500" />
                  Réseaux Sociaux
                </h3>
                <div className="space-y-3">
                  {student.linkedIn && (
                    <a 
                      href={formatUrl(student.linkedIn)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition text-text-muted hover:text-blue-400"
                    >
                      <Linkedin size={20} />
                      <span className="font-medium">LinkedIn</span>
                    </a>
                  )}
                  {student.github && (
                    <a 
                      href={formatUrl(student.github)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition text-text-muted hover:text-white"
                    >
                      <Github size={20} />
                      <span className="font-medium">GitHub</span>
                    </a>
                  )}
                  {student.portfolio && (
                    <a 
                      href={formatUrl(student.portfolio)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition text-text-muted hover:text-primary-400"
                    >
                      <Globe size={20} />
                      <span className="font-medium">Portfolio</span>
                    </a>
                  )}
                  {!student.linkedIn && !student.github && !student.portfolio && (
                    <p className="text-text-muted text-sm italic">Aucun réseau social renseigné.</p>
                  )}
                </div>
              </div>

              <div className="bg-background/50 rounded-xl p-6 border border-white/5">
                <h3 className="font-bold text-text mb-4 flex items-center gap-2">
                  <Globe size={20} className="text-primary-500" />
                  Langues
                </h3>
                <div className="space-y-3">
                  {student.languages.map((lang, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-text">{lang.lang}</span>
                      <span className="px-2 py-1 bg-white/5 rounded text-xs font-medium text-primary-400 border border-primary-500/20">
                        {lang.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Localisation Map */}
              {student.location && (
                <div className="bg-background/50 rounded-xl p-6 border border-white/5">
                  <h3 className="font-bold text-text mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-primary-500" />
                    Localisation
                  </h3>
                  <div className="rounded-lg overflow-hidden h-48 border border-white/10 relative group">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      scrolling="no" 
                      marginHeight={0} 
                      marginWidth={0} 
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(student.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                      className="filter grayscale hover:grayscale-0 transition-all duration-500"
                      title="Localisation"
                    ></iframe>
                    <div className="absolute inset-0 pointer-events-none border border-white/10 rounded-lg shadow-inner"></div>
                  </div>
                  <p className="text-xs text-text-muted mt-2 text-center">
                    {student.location}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};
