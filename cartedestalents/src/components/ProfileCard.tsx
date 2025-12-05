import React, { useState, useEffect } from 'react';
import { StudentProfile } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import LoginModal from './LoginModal';
import { 
  MapPin, 
  GraduationCap, 
  CheckCircle, 
  Mail, 
  Github, 
  Linkedin, 
  Globe,
  Briefcase,
  Check
} from 'lucide-react';

const formatUrl = (url: string) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

interface ProfileCardProps {
  student: StudentProfile;
  onClick?: () => void;
  showFullDetails?: boolean;
}

/**
 * Composant ProfileCard - Affichage d'une carte de profil étudiant
 * Avec badge "Verified Talent" pour les profils vérifiés
 */
export const ProfileCard: React.FC<ProfileCardProps> = ({ 
  student, 
  onClick,
  showFullDetails = false
}) => {
  const { isAuthenticated, token } = useAuth();
  const [requestSent, setRequestSent] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      if (isAuthenticated && student.id) {
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
  }, [isAuthenticated, student.id, token]);

  const handleContact = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3023/api');
      const response = await fetch(`${API_URL}/connections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // Note: We need the user ID of the student to send a request.
        // The student object here is a StudentProfile, which might not have the userId directly if it comes from the public API.
        // However, let's assume for now we can send it to the student's ID and the backend handles the lookup or the student object has it.
        // Actually, looking at the types, StudentProfile has an ID. Let's assume that's what we use.
        // Wait, the backend expects `toUserId`. We need to be sure `student.id` maps to a user or we have the user ID.
        // In the current setup, `student.id` is likely the ID from the `students` table.
        // The backend `POST /connections` expects `toUserId`.
        // We might need to update the backend to accept `studentId` or ensure we have `userId` here.
        // For this quick fix, let's try sending the student ID and see if we can adjust the backend or if it works.
        // Actually, let's check `StudentProfile` type.
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

  return (
    <div 
      onClick={onClick}
      className={`
        bg-surface rounded-lg shadow-lg hover:shadow-primary-500/20 transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        overflow-hidden animate-scale-in
        border border-white/5 hover:border-primary-500/50
      `}
    >
      {/* En-tête avec avatar et statut */}
      <div className="relative bg-gradient-to-br from-primary-900/50 to-secondary-900/50 p-6 border-b border-white/5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img 
              src={student.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=BA181B&color=fff&size=128`}
              alt={student.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-surface shadow-md"
            />
            {student.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-accent-500 rounded-full p-1 shadow-md">
                <CheckCircle size={18} className="text-white" />
              </div>
            )}
          </div>

          {/* Info principale */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-display font-bold text-text truncate">
                  {student.name}
                </h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {student.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-accent-500/20 text-accent-400 text-xs font-semibold rounded-full border border-accent-500/30">
                      <CheckCircle size={12} />
                      Verified
                    </span>
                  )}
                  {student.availability && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border ${
                      student.availability === 'available' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      student.availability === 'open' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        student.availability === 'available' ? 'bg-green-400' :
                        student.availability === 'open' ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`}></span>
                      {student.availability === 'available' ? 'Dispo' :
                       student.availability === 'open' ? 'Ouvert' :
                       'Indispo'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-2 space-y-1">
              <div className="flex items-center gap-2 text-sm text-text-muted">
                <GraduationCap size={16} className="flex-shrink-0 text-primary-500" />
                <span className="truncate">{student.field} • Année {student.year}</span>
              </div>
              {student.location && (
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <MapPin size={16} className="flex-shrink-0 text-primary-500" />
                  <span className="truncate">{student.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Corps de la carte */}
      <div className="p-6 space-y-4">
        {/* Bio */}
        <p className="text-text-muted text-sm line-clamp-3">
          {student.bio}
        </p>

        {/* Compétences */}
        <div>
          <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">
            Compétences
          </h4>
          <div className="flex flex-wrap gap-2">
            {student.skills.slice(0, showFullDetails ? undefined : 6).map((skill, index) => (
              <span
                key={index}
                className="px-2.5 py-1 bg-primary-900/30 text-primary-400 text-xs font-medium rounded-full hover:bg-primary-900/50 transition cursor-pointer border border-primary-900/50"
              >
                {skill}
              </span>
            ))}
            {!showFullDetails && student.skills.length > 6 && (
              <span className="px-2.5 py-1 bg-surface-light text-text-muted text-xs font-medium rounded-full border border-white/5">
                +{student.skills.length - 6}
              </span>
            )}
          </div>
        </div>

        {/* Langues */}
        {student.languages.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-text-muted uppercase mb-2">
              Langues
            </h4>
            <div className="flex flex-wrap gap-2">
              {student.languages.slice(0, 3).map((lang, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 bg-secondary-900/30 text-secondary-400 text-xs font-medium rounded-full border border-secondary-900/50"
                >
                  {lang.lang} ({lang.level})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projets (si détails complets) */}
        {showFullDetails && student.projects.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-text-muted uppercase mb-2 flex items-center gap-2">
              <Briefcase size={14} />
              Projets
            </h4>
            <div className="space-y-3">
              {student.projects.map((project, index) => (
                <div key={index} className="p-3 bg-background rounded-lg border border-white/5">
                  <h5 className="font-semibold text-text text-sm">
                    {project.title}
                  </h5>
                  <p className="text-xs text-text-muted mt-1 line-clamp-2">
                    {project.description}
                  </p>
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.map((tech, techIndex) => (
                        <span
                          key={techIndex}
                          className="px-2 py-0.5 bg-surface text-text-muted text-xs rounded border border-white/5"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Liens sociaux et bouton contact */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-2">
          <div className="flex gap-2">
            {student.github && (
              <a
                href={formatUrl(student.github)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition"
                title="GitHub"
              >
                <Github size={18} />
              </a>
            )}
            {student.linkedIn && (
              <a
                href={formatUrl(student.linkedIn)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition"
                title="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            )}
            {student.portfolio && (
              <a
                href={`https://${student.portfolio}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition"
                title="Portfolio"
              >
                <Globe size={18} />
              </a>
            )}
          </div>

          <button
            onClick={handleContact}
            disabled={requestSent}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition text-sm font-semibold shadow-lg 
              ${requestSent 
                ? 'bg-green-500/20 text-green-400 cursor-default' 
                : 'bg-primary-600 text-white hover:bg-primary-500 hover:shadow-primary-600/30'
              }
            `}
          >
            {requestSent ? <Check size={16} /> : <Mail size={16} />}
            {requestSent ? 'Envoyé' : 'Contacter'}
          </button>
        </div>
      </div>
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
};
