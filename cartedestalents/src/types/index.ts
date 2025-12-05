export interface User {
  id: string;
  email: string;
  name: string;
}

/**
 * Interface principale pour le profil étudiant
 */
export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio: string;
  field: string; // Filière d'études
  year: number; // Année d'études
  skills: string[];
  languages: Language[];
  projects: Project[];
  isVerified: boolean;
  location?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface pour les langues maîtrisées
 */
export interface Language {
  lang: string;
  level: LanguageLevel;
}

/**
 * Niveaux de maîtrise des langues (CECRL)
 */
export type LanguageLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Natif';

/**
 * Interface pour les projets
 */
export interface Project {
  id?: string;
  title: string;
  description: string;
  imageUrl?: string;
  technologies?: string[];
  link?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  startDate?: Date;
  endDate?: Date;
  status?: ProjectStatus;
}

/**
 * Statut d'un projet
 */
export type ProjectStatus = 'En cours' | 'Terminé' | 'En pause' | 'Archivé';

/**
 * Interface pour les filtres de recherche
 */
export interface SearchFilters {
  keyword: string;
  skills: string[];
  languages: string[];
  fields: string[];
  isVerified?: boolean;
  minYear?: number;
  maxYear?: number;
}

/**
 * Interface pour les données du formulaire de profil
 */
export interface ProfileFormData {
  name: string;
  email: string;
  bio: string;
  field: string;
  year: number;
  skills: string[];
  languages: Language[];
  projects: Project[];
  location?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
}

/**
 * Interface pour les statistiques des compétences
 */
export interface SkillStatistic {
  skill: string;
  count: number;
  percentage: number;
}

/**
 * Interface pour le contexte des étudiants
 */
export interface StudentContextType {
  students: StudentProfile[];
  addStudent: (student: StudentProfile) => void;
  updateStudent: (id: string, student: Partial<StudentProfile>) => void;
  deleteStudent: (id: string) => void;
  getStudentById: (id: string) => StudentProfile | undefined;
  getSkillStatistics: () => SkillStatistic[];
  searchStudents: (filters: SearchFilters) => StudentProfile[];
}

/**
 * Type pour les options de tri
 */
export type SortOption = 'name' | 'field' | 'year' | 'recent';

/**
 * Interface pour les notifications
 */
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}
