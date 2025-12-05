import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '@/contexts/StudentContext';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileForm } from '@/components/ProfileForm';
import { StudentProfile } from '@/types';
import { CheckCircle } from 'lucide-react';

/**
 * Page d'ajout d'un nouveau profil
 */
export const AddProfilePage: React.FC = () => {
  const { addStudent } = useStudents();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (student: StudentProfile) => {
    addStudent(student);
    setShowSuccess(true);
    
    // Redirection après 2 secondes
    setTimeout(() => {
      navigate('/talents');
    }, 2000);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (showSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-surface rounded-lg shadow-2xl p-12 text-center max-w-md animate-scale-in border border-white/10">
          <div className="w-20 h-20 bg-accent-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-accent-500/30">
            <CheckCircle className="text-accent-500" size={40} />
          </div>
          <h2 className="font-display font-bold text-3xl text-text mb-4">
            Profil créé avec succès !
          </h2>
          <p className="text-text-muted mb-6">
            Votre profil a été ajouté à la plateforme. Vous allez être redirigé...
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full mx-auto animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-display font-bold text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-white to-text-muted mb-4">
          Créer votre Profil
        </h1>
        <p className="text-text-muted text-lg max-w-2xl mx-auto">
          Rejoignez l'élite des talents étudiants. Complétez votre profil étape par étape pour mettre en avant vos compétences et projets.
        </p>
      </div>

      {/* Formulaire */}
      <ProfileForm 
        onSubmit={handleSubmit} 
        onCancel={handleCancel} 
        initialData={user ? { name: user.name, email: user.email } as any : undefined}
      />
    </div>
  );
};
