import React, { useState, useCallback, useEffect } from 'react';
import { StudentProfile, Project, LanguageLevel } from '@/types';
import { availableFields } from '@/services/data';
import { locations } from '@/services/locations';
import { Plus, X, Save, ChevronRight, ChevronLeft, User, Code, Briefcase, Share2, Upload, Github, Linkedin } from 'lucide-react';

const formatUrl = (url: string) => {
  if (!url) return '#';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

interface ProfileFormProps {
  initialData?: StudentProfile;
  onSubmit: (data: StudentProfile) => void;
  onCancel?: () => void;
}

/**
 * Formulaire de profil étudiant avec validation complète (Wizard)
 */
export const ProfileForm: React.FC<ProfileFormProps> = ({ 
  initialData, 
  onSubmit, 
  onCancel 
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<StudentProfile>>(
    initialData || {
      name: '',
      email: '',
      bio: '',
      field: '',
      year: 1,
      skills: [],
      passions: [],
      availability: 'available',
      languages: [],
      projects: [],
      isVerified: false,
      location: '',
      linkedIn: '',
      github: '',
      portfolio: '',
    }
  );

  const [currentSkill, setCurrentSkill] = useState('');
  const [currentPassion, setCurrentPassion] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState({ lang: '', level: 'B1' as LanguageLevel });
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({ title: '', description: '', imageUrl: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // États pour la localisation
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  // Mettre à jour la localisation quand pays/ville changent
  useEffect(() => {
    if (selectedCountry && selectedCity) {
      setFormData(prev => ({ ...prev, location: `${selectedCity}, ${selectedCountry}` }));
    } else if (selectedCountry) {
      setFormData(prev => ({ ...prev, location: selectedCountry }));
    }
  }, [selectedCountry, selectedCity]);

  const steps = [
    { id: 1, title: 'Identité', icon: User },
    { id: 2, title: 'Expertise', icon: Code },
    { id: 3, title: 'Projets', icon: Briefcase },
    { id: 4, title: 'Social', icon: Share2 },
  ];

  /**
   * Validation par étape
   */
  const validateStep = useCallback((currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.name || formData.name.trim().length < 2) newErrors.name = 'Le nom doit contenir au moins 2 caractères';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email || !emailRegex.test(formData.email)) newErrors.email = 'Email invalide';
      if (!formData.bio || formData.bio.trim().length < 20) newErrors.bio = 'La bio doit contenir au moins 20 caractères';
      if (!formData.field) newErrors.field = 'Veuillez sélectionner une filière';
      if (!formData.year || formData.year < 1 || formData.year > 6) newErrors.year = 'L\'année doit être entre 1 et 6';
    }

    if (currentStep === 2) {
      if (!formData.skills || formData.skills.length === 0) newErrors.skills = 'Ajoutez au moins une compétence';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 4));
      window.scrollTo(0, 0);
    }
  };

  const handlePrev = () => {
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  /**
   * Ajouter une compétence
   */
  const addSkill = useCallback(() => {
    if (currentSkill.trim() && !formData.skills?.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), currentSkill.trim()]
      }));
      setCurrentSkill('');
      if (errors.skills) setErrors(prev => ({ ...prev, skills: '' }));
    }
  }, [currentSkill, formData.skills, errors.skills]);

  /**
   * Retirer une compétence
   */
  const removeSkill = useCallback((skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter(s => s !== skill) || []
    }));
  }, []);

  /**
   * Ajouter une passion
   */
  const addPassion = useCallback(() => {
    if (currentPassion.trim() && !formData.passions?.includes(currentPassion.trim())) {
      setFormData(prev => ({
        ...prev,
        passions: [...(prev.passions || []), currentPassion.trim()]
      }));
      setCurrentPassion('');
    }
  }, [currentPassion, formData.passions]);

  /**
   * Retirer une passion
   */
  const removePassion = useCallback((passion: string) => {
    setFormData(prev => ({
      ...prev,
      passions: prev.passions?.filter(p => p !== passion) || []
    }));
  }, []);

  /**
   * Ajouter une langue
   */
  const addLanguage = useCallback(() => {
    if (currentLanguage.lang.trim()) {
      setFormData(prev => ({
        ...prev,
        languages: [...(prev.languages || []), currentLanguage]
      }));
      setCurrentLanguage({ lang: '', level: 'B1' });
    }
  }, [currentLanguage]);

  /**
   * Retirer une langue
   */
  const removeLanguage = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages?.filter((_, i) => i !== index) || []
    }));
  }, []);

  /**
   * Gérer l'upload d'image
   */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentProject(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Ajouter un projet
   */
  const addProject = useCallback(() => {
    if (currentProject.title?.trim() && currentProject.description?.trim()) {
      setFormData(prev => ({
        ...prev,
        projects: [...(prev.projects || []), currentProject as Project]
      }));
      setCurrentProject({ title: '', description: '', imageUrl: '', linkedinUrl: '', githubUrl: '' });
    }
  }, [currentProject]);

  /**
   * Retirer un projet
   */
  const removeProject = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects?.filter((_, i) => i !== index) || []
    }));
  }, []);

  /**
   * Gestion de la soumission finale
   */
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateStep(1) && validateStep(2)) {
      const studentData: StudentProfile = {
        id: initialData?.id || Date.now().toString(),
        name: formData.name!,
        email: formData.email!,
        bio: formData.bio!,
        field: formData.field!,
        year: formData.year!,
        skills: formData.skills!,
        languages: formData.languages!,
        projects: formData.projects!,
        isVerified: formData.isVerified || false,
        location: formData.location,
        linkedIn: formData.linkedIn,
        github: formData.github,
        portfolio: formData.portfolio,
        avatar: formData.avatar,
        passions: formData.passions || [],
        availability: formData.availability || 'available',
        createdAt: initialData?.createdAt || new Date(),
        updatedAt: new Date(),
      };
      
      onSubmit(studentData);
    }
  }, [formData, initialData, validateStep, onSubmit]);

  const languageLevels: LanguageLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'Natif'];

  return (
    <div className="space-y-8">
      {/* Stepper */}
      <div className="relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10"></div>
        <div className="flex justify-between">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = s.id === step;
            const isCompleted = s.id < step;
            
            return (
              <div key={s.id} className="flex flex-col items-center gap-2 bg-background px-2">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isActive 
                      ? 'border-primary-500 bg-primary-500/20 text-primary-500 scale-110 shadow-[0_0_15px_rgba(186,24,27,0.5)]' 
                      : isCompleted
                        ? 'border-success-500 bg-success-500/20 text-success-500'
                        : 'border-white/10 bg-surface text-text-muted'
                  }`}
                >
                  <Icon size={20} />
                </div>
                <span className={`text-xs font-medium transition-colors ${isActive ? 'text-primary-500' : 'text-text-muted'}`}>
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface/50 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/5 min-h-[400px] flex flex-col">
        
        <div className="flex-1">
          {/* Étape 1: Identité */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-2xl font-display font-bold text-text mb-6 flex items-center gap-3">
                <User className="text-primary-500" />
                Informations Personnelles
              </h3>

              {/* Avatar Upload */}
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface shadow-xl bg-surface">
                    {formData.avatar ? (
                      <img 
                        src={formData.avatar} 
                        alt="Avatar preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-white/5 text-text-muted">
                        <User size={48} />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-primary-600 rounded-full cursor-pointer hover:bg-primary-500 transition shadow-lg border-2 border-surface group-hover:scale-110">
                    <Upload size={20} className="text-white" />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text/80 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-text placeholder-text/30 ${
                      errors.name ? 'border-red-500' : 'border-white/10'
                    }`}
                    placeholder="Jean Dupont"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text/80 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className={`w-full px-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-text placeholder-text/30 ${
                      errors.email ? 'border-red-500' : 'border-white/10'
                    }`}
                    placeholder="jean.dupont@ecole.fr"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text/80 mb-2">
                  Bio *
                </label>
                <textarea
                  value={formData.bio}
                  onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className={`w-full px-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-text h-32 placeholder-text/30 ${
                    errors.bio ? 'border-red-500' : 'border-white/10'
                  }`}
                  placeholder="Présentez-vous en quelques phrases..."
                />
                {errors.bio && <p className="text-red-500 text-xs mt-1">{errors.bio}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-text/80 mb-2">
                    Filière *
                  </label>
                  <select
                    value={formData.field}
                    onChange={e => setFormData(prev => ({ ...prev, field: e.target.value }))}
                    className={`w-full px-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-text ${
                      errors.field ? 'border-red-500' : 'border-white/10'
                    }`}
                  >
                    <option value="" className="bg-background text-text">Sélectionner une filière</option>
                    {availableFields.map(field => (
                      <option key={field} value={field} className="bg-background text-text">{field}</option>
                    ))}
                  </select>
                  {errors.field && <p className="text-red-500 text-xs mt-1">{errors.field}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text/80 mb-2">
                    Année d'études *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={formData.year}
                    onChange={e => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className={`w-full px-4 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-text ${
                      errors.year ? 'border-red-500' : 'border-white/10'
                    }`}
                  />
                  {errors.year && <p className="text-red-500 text-xs mt-1">{errors.year}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text/80 mb-2">
                  Disponibilité
                </label>
                <select
                  value={formData.availability || 'available'}
                  onChange={e => setFormData(prev => ({ ...prev, availability: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-text"
                >
                  <option value="available" className="bg-background text-text">Disponible pour projets</option>
                  <option value="open" className="bg-background text-text">Ouvert aux échanges</option>
                  <option value="unavailable" className="bg-background text-text">Non disponible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text/80 mb-2">
                  Localisation
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={selectedCountry}
                    onChange={e => {
                      setSelectedCountry(e.target.value);
                      setSelectedCity(''); // Reset city when country changes
                    }}
                    className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-text"
                  >
                    <option value="" className="bg-background text-text">Sélectionner un pays</option>
                    {locations.map(country => (
                      <option key={country.name} value={country.name} className="bg-background text-text">
                        {country.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedCity}
                    onChange={e => setSelectedCity(e.target.value)}
                    disabled={!selectedCountry}
                    className={`w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-text ${
                      !selectedCountry ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <option value="" className="bg-background text-text">Sélectionner une ville</option>
                    {selectedCountry && locations.find(c => c.name === selectedCountry)?.cities.map(city => (
                      <option key={city} value={city} className="bg-background text-text">
                        {city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Expertise */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-in">
              <h3 className="text-2xl font-display font-bold text-text mb-6 flex items-center gap-3">
                <Code className="text-primary-500" />
                Compétences & Langues
              </h3>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-text/80">
                  Compétences techniques *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    className="flex-1 px-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-text placeholder-text/30"
                    placeholder="Ex: React, Python, Design..."
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition flex items-center gap-2 font-medium"
                  >
                    <Plus size={20} />
                    Ajouter
                  </button>
                </div>
                {errors.skills && <p className="text-red-500 text-sm">{errors.skills}</p>}

                <div className="flex flex-wrap gap-2 min-h-[50px] p-4 bg-background/30 rounded-xl border border-white/5">
                  {formData.skills?.length === 0 && (
                    <p className="text-text-muted/50 text-sm italic">Aucune compétence ajoutée</p>
                  )}
                  {formData.skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-primary-500/20 text-primary-200 border border-primary-500/30 rounded-lg text-sm flex items-center gap-2 animate-scale-in"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-white transition"
                      >
                        <X size={16} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/10">
                <label className="block text-sm font-medium text-text/80">
                  Passions / Centres d'intérêt
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentPassion}
                    onChange={(e) => setCurrentPassion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPassion())}
                    className="flex-1 px-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-text placeholder-text/30"
                    placeholder="Ex: Photographie, Echecs, Randonnée..."
                  />
                  <button
                    type="button"
                    onClick={addPassion}
                    className="px-6 py-3 bg-secondary-600 text-white rounded-xl hover:bg-secondary-700 transition flex items-center gap-2 font-medium"
                  >
                    <Plus size={20} />
                    Ajouter
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 min-h-[50px] p-4 bg-background/30 rounded-xl border border-white/5">
                  {(!formData.passions || formData.passions.length === 0) && (
                    <p className="text-text-muted/50 text-sm italic">Aucune passion ajoutée</p>
                  )}
                  {formData.passions?.map((passion, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-secondary-500/20 text-secondary-200 border border-secondary-500/30 rounded-lg text-sm flex items-center gap-2 animate-scale-in"
                    >
                      {passion}
                      <button
                        type="button"
                        onClick={() => removePassion(passion)}
                        className="hover:text-white transition"
                      >
                        <X size={16} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-white/10">
                <label className="block text-sm font-medium text-text/80">
                  Langues parlées
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentLanguage.lang}
                    onChange={(e) => setCurrentLanguage(prev => ({ ...prev, lang: e.target.value }))}
                    className="flex-1 px-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-text placeholder-text/30"
                    placeholder="Langue (ex: Anglais)"
                  />
                  <select
                    value={currentLanguage.level}
                    onChange={(e) => setCurrentLanguage(prev => ({ ...prev, level: e.target.value as LanguageLevel }))}
                    className="px-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-text"
                  >
                    {languageLevels.map(level => (
                      <option key={level} value={level} className="bg-background text-text">{level}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addLanguage}
                    className="px-6 py-3 bg-secondary-600 text-white rounded-xl hover:bg-secondary-700 transition flex items-center gap-2"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.languages?.map((lang, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background/30 border border-white/5 rounded-xl animate-fade-in">
                      <span className="font-medium text-text">{lang.lang} <span className="text-text-muted">- {lang.level}</span></span>
                      <button
                        type="button"
                        onClick={() => removeLanguage(index)}
                        className="text-red-500 hover:text-red-400 transition"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Étape 3: Projets */}
          {step === 3 && (
            <div className="space-y-8 animate-fade-in">
              <h3 className="text-2xl font-display font-bold text-text mb-6 flex items-center gap-3">
                <Briefcase className="text-primary-500" />
                Projets Réalisés
              </h3>

              <div className="bg-background/30 p-6 rounded-xl border border-white/5 space-y-4">
                <input
                  type="text"
                  value={currentProject.title || ''}
                  onChange={(e) => setCurrentProject(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-text placeholder-text/30"
                  placeholder="Titre du projet"
                />
                <textarea
                  value={currentProject.description || ''}
                  onChange={(e) => setCurrentProject(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-text placeholder-text/30"
                  placeholder="Description détaillée du projet..."
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={currentProject.linkedinUrl || ''}
                      onChange={(e) => setCurrentProject(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                      className="w-full pl-12 pr-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-text placeholder-text/30"
                      placeholder="Lien LinkedIn du post"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                      <Linkedin size={18} />
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={currentProject.githubUrl || ''}
                      onChange={(e) => setCurrentProject(prev => ({ ...prev, githubUrl: e.target.value }))}
                      className="w-full pl-12 pr-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-text placeholder-text/30"
                      placeholder="Lien du repo GitHub"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                      <Github size={18} />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="project-image-upload"
                  />
                  <label 
                    htmlFor="project-image-upload"
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-background/50 border border-dashed border-white/20 rounded-xl cursor-pointer hover:bg-background/70 hover:border-primary-500/50 transition group"
                  >
                    <div className="p-2 bg-white/5 rounded-lg group-hover:bg-primary-500/20 transition">
                      <Upload size={20} className="text-text-muted group-hover:text-primary-500" />
                    </div>
                    <span className="text-text-muted group-hover:text-text transition">
                      {currentProject.imageUrl ? 'Changer l\'image' : 'Uploader une image du projet'}
                    </span>
                  </label>
                  {currentProject.imageUrl && (
                    <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden border border-white/10">
                      <img 
                        src={currentProject.imageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setCurrentProject(prev => ({ ...prev, imageUrl: '' }))}
                        className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-red-500 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={addProject}
                  className="w-full px-4 py-3 bg-accent-600 text-white rounded-xl hover:bg-accent-700 transition flex items-center justify-center gap-2 font-medium"
                >
                  <Plus size={20} />
                  Ajouter le projet
                </button>
              </div>

              <div className="space-y-4">
                {formData.projects?.length === 0 && (
                  <div className="text-center py-8 text-text-muted">
                    <Briefcase className="mx-auto mb-2 opacity-50" size={40} />
                    <p>Aucun projet ajouté pour le moment</p>
                  </div>
                )}
                {formData.projects?.map((project, index) => (
                  <div key={index} className="p-5 bg-background/30 border border-white/5 rounded-xl hover:border-primary-500/30 transition group animate-fade-in">
                    <div className="flex items-start gap-4">
                      {project.imageUrl && (
                        <img 
                          src={project.imageUrl} 
                          alt={project.title} 
                          className="w-24 h-24 object-cover rounded-lg border border-white/10"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-text text-lg">{project.title}</h4>
                          <button
                            type="button"
                            onClick={() => removeProject(index)}
                            className="text-red-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                          >
                            <X size={20} />
                          </button>
                        </div>
                        <p className="text-text-muted mt-2 leading-relaxed">{project.description}</p>
                        
                        <div className="flex gap-3 mt-3">
                          {project.linkedinUrl && (
                            <a href={formatUrl(project.linkedinUrl)} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition flex items-center gap-1 text-sm">
                              <Linkedin size={14} /> Post LinkedIn
                            </a>
                          )}
                          {project.githubUrl && (
                            <a href={formatUrl(project.githubUrl)} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-white transition flex items-center gap-1 text-sm">
                              <Github size={14} /> Repo GitHub
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Étape 4: Social */}
          {step === 4 && (
            <div className="space-y-8 animate-fade-in">
              <h3 className="text-2xl font-display font-bold text-text mb-6 flex items-center gap-3">
                <Share2 className="text-primary-500" />
                Réseaux & Liens
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text/80 mb-2">
                    LinkedIn
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.linkedIn || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, linkedIn: e.target.value }))}
                      className="w-full pl-12 pr-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-text placeholder-text/30"
                      placeholder="linkedin.com/in/..."
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                      <Share2 size={18} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text/80 mb-2">
                    GitHub
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.github || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, github: e.target.value }))}
                      className="w-full pl-12 pr-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-text placeholder-text/30"
                      placeholder="github.com/..."
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                      <Code size={18} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text/80 mb-2">
                    Portfolio
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.portfolio || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, portfolio: e.target.value }))}
                      className="w-full pl-12 pr-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-text placeholder-text/30"
                      placeholder="monportfolio.com"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                      <Briefcase size={18} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary-900/20 p-6 rounded-xl border border-primary-500/20 mt-8">
                <h4 className="font-semibold text-primary-200 mb-2">Prêt à publier ?</h4>
                <p className="text-sm text-primary-300/80">
                  En cliquant sur "Enregistrer", votre profil sera visible par tous les recruteurs et étudiants de la plateforme.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-8 mt-8 border-t border-white/10">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-6 py-3 bg-surface border border-white/10 text-text rounded-xl hover:bg-white/5 transition font-semibold flex items-center gap-2"
            >
              <ChevronLeft size={20} />
              Précédent
            </button>
          ) : (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-surface border border-white/10 text-text rounded-xl hover:bg-white/5 transition font-semibold"
            >
              Annuler
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-8 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition font-semibold flex items-center gap-2 shadow-lg hover:shadow-primary-500/20"
            >
              Suivant
              <ChevronRight size={20} />
            </button>
          ) : (
            <button
              type="submit"
              className="px-8 py-3 bg-success-600 text-white rounded-xl hover:bg-success-700 transition font-semibold flex items-center gap-2 shadow-lg hover:shadow-success-500/20"
            >
              <Save size={20} />
              Enregistrer le profil
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
