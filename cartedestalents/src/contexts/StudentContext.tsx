import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { StudentProfile, StudentContextType, SearchFilters, SkillStatistic } from '@/types';
import { api } from '@/services/api';

const StudentContext = createContext<StudentContextType | undefined>(undefined);

interface StudentProviderProps {
  children: ReactNode;
}

/**
 * Provider pour gérer l'état global des profils étudiants
 */
export const StudentProvider: React.FC<StudentProviderProps> = ({ children }) => {
  const [students, setStudents] = useState<StudentProfile[]>([]);

  // Charger les données au démarrage
  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await api.getAllStudents();
        setStudents(data);
      } catch (error) {
        console.error("Failed to load students", error);
      }
    };
    loadStudents();
  }, []);

  /**
   * Ajouter un nouveau profil étudiant
   */
  const addStudent = useCallback(async (student: StudentProfile) => {
    // Optimistic update
    setStudents(prev => [...prev, student]);
    // API call
    await api.createStudent(student);
  }, []);

  /**
   * Mettre à jour un profil étudiant existant
   */
  const updateStudent = useCallback((id: string, updatedData: Partial<StudentProfile>) => {
    setStudents(prev => 
      prev.map(student => 
        student.id === id 
          ? { ...student, ...updatedData, updatedAt: new Date() }
          : student
      )
    );
  }, []);

  /**
   * Supprimer un profil étudiant
   */
  const deleteStudent = useCallback((id: string) => {
    setStudents(prev => prev.filter(student => student.id !== id));
  }, []);

  /**
   * Récupérer un étudiant par son ID
   */
  const getStudentById = useCallback((id: string): StudentProfile | undefined => {
    return students.find(student => student.id === id);
  }, [students]);

  /**
   * Calculer les statistiques des compétences (pour le SkillCloud)
   */
  const getSkillStatistics = useCallback((): SkillStatistic[] => {
    const skillCounts = new Map<string, number>();
    
    // Compter les occurrences de chaque compétence
    students.forEach(student => {
      student.skills.forEach(skill => {
        skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1);
      });
    });

    const totalStudents = students.length;
    
    // Convertir en tableau et calculer les pourcentages
    return Array.from(skillCounts.entries())
      .map(([skill, count]) => ({
        skill,
        count,
        percentage: (count / totalStudents) * 100
      }))
      .sort((a, b) => b.count - a.count);
  }, [students]);

  /**
   * Rechercher des étudiants avec filtres multiples (optimisé avec useMemo)
   */
  const searchStudents = useCallback((filters: SearchFilters): StudentProfile[] => {
    return students.filter(student => {
      // Filtre par mot-clé (nom, bio, email)
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        const matchesKeyword = 
          student.name.toLowerCase().includes(keyword) ||
          student.bio.toLowerCase().includes(keyword) ||
          student.email.toLowerCase().includes(keyword) ||
          student.field.toLowerCase().includes(keyword);
        
        if (!matchesKeyword) return false;
      }

      // Filtre par compétences (doit avoir au moins une des compétences)
      if (filters.skills && filters.skills.length > 0) {
        const hasSkill = filters.skills.some(skill => 
          student.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
        );
        if (!hasSkill) return false;
      }

      // Filtre par langues
      if (filters.languages && filters.languages.length > 0) {
        const hasLanguage = filters.languages.some(lang => 
          student.languages.some(l => l.lang.toLowerCase().includes(lang.toLowerCase()))
        );
        if (!hasLanguage) return false;
      }

      // Filtre par filières
      if (filters.fields && filters.fields.length > 0) {
        const matchesField = filters.fields.some(field => 
          student.field.toLowerCase() === field.toLowerCase()
        );
        if (!matchesField) return false;
      }

      // Filtre par statut de vérification
      if (filters.isVerified !== undefined) {
        if (student.isVerified !== filters.isVerified) return false;
      }

      // Filtre par année d'études
      if (filters.minYear !== undefined && student.year < filters.minYear) {
        return false;
      }
      if (filters.maxYear !== undefined && student.year > filters.maxYear) {
        return false;
      }

      return true;
    });
  }, [students]);

  const value = useMemo(() => ({
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentById,
    getSkillStatistics,
    searchStudents,
  }), [students, addStudent, updateStudent, deleteStudent, getStudentById, getSkillStatistics, searchStudents]);

  return (
    <StudentContext.Provider value={value}>
      {children}
    </StudentContext.Provider>
  );
};

/**
 * Hook personnalisé pour accéder au contexte des étudiants
 */
export const useStudents = (): StudentContextType => {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudents must be used within a StudentProvider');
  }
  return context;
};
