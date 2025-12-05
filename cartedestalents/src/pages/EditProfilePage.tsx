import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '@/contexts/StudentContext';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileForm } from '@/components/ProfileForm';
import { StudentProfile } from '@/types';
import { Loader, CheckCircle } from 'lucide-react';

export const EditProfilePage: React.FC = () => {
  const { students, updateStudent } = useStudents();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | undefined>(undefined);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Wait for students to load if empty (though they load on mount)
    // In a real app we might fetch specific user profile
    if (user) {
      const profile = students.find(s => s.email === user.email);
      if (profile) {
        setStudentProfile(profile);
      } else {
        // If no profile found, redirect to add page
        // But we should wait a bit to ensure students are loaded
        if (students.length > 0) {
             navigate('/add');
        }
      }
      // If students are empty, we might be loading. 
      // But StudentContext loads on mount. 
      // Let's assume if students is empty after a timeout, user has no profile.
    }
    setLoading(false);
  }, [user, students, isAuthenticated, navigate]);

  const handleSubmit = (updatedData: StudentProfile) => {
    if (studentProfile) {
      updateStudent(studentProfile.id, updatedData);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/talents');
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader className="animate-spin text-primary-500" size={40} />
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-surface rounded-lg shadow-2xl p-12 text-center max-w-md animate-scale-in border border-white/10">
          <div className="w-20 h-20 bg-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
            <CheckCircle className="text-green-500" size={40} />
          </div>
          <h2 className="font-display font-bold text-3xl text-text mb-4">
            Profil mis à jour !
          </h2>
          <p className="text-text-muted mb-6">
            Vos modifications ont été enregistrées avec succès.
          </p>
        </div>
      </div>
    );
  }

  if (!studentProfile) {
      // Fallback if redirect didn't happen or waiting for data
      return (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-bold text-text mb-4">Aucun profil trouvé</h2>
              <p className="text-text-muted mb-6">Vous n'avez pas encore créé de carte de talent.</p>
              <button 
                onClick={() => navigate('/add')}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-500 transition"
              >
                  Créer ma carte
              </button>
          </div>
      )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text">Modifier ma carte</h1>
        <p className="text-text-muted mt-2">Mettez à jour vos compétences et expériences</p>
      </div>
      
      <ProfileForm 
        initialData={studentProfile} 
        onSubmit={handleSubmit}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
};
