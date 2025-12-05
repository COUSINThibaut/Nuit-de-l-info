import { useState, useCallback, useMemo } from 'react';
import { SearchFilters } from '@/types';

/**
 * Hook personnalisé pour gérer les filtres de recherche
 */
export const useSearchFilters = () => {
  const [filters, setFilters] = useState<SearchFilters>({
    keyword: '',
    skills: [],
    languages: [],
    fields: [],
    isVerified: undefined,
    minYear: undefined,
    maxYear: undefined,
  });

  const updateKeyword = useCallback((keyword: string) => {
    setFilters(prev => ({ ...prev, keyword }));
  }, []);

  const toggleSkill = useCallback((skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  }, []);

  const toggleLanguage = useCallback((language: string) => {
    setFilters(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  }, []);

  const toggleField = useCallback((field: string) => {
    setFilters(prev => ({
      ...prev,
      fields: prev.fields.includes(field)
        ? prev.fields.filter(f => f !== field)
        : [...prev.fields, field]
    }));
  }, []);

  const setVerifiedFilter = useCallback((isVerified: boolean | undefined) => {
    setFilters(prev => ({ ...prev, isVerified }));
  }, []);

  const setYearRange = useCallback((minYear?: number, maxYear?: number) => {
    setFilters(prev => ({ ...prev, minYear, maxYear }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      keyword: '',
      skills: [],
      languages: [],
      fields: [],
      isVerified: undefined,
      minYear: undefined,
      maxYear: undefined,
    });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.keyword.length > 0 ||
      filters.skills.length > 0 ||
      filters.languages.length > 0 ||
      filters.fields.length > 0 ||
      filters.isVerified !== undefined ||
      filters.minYear !== undefined ||
      filters.maxYear !== undefined
    );
  }, [filters]);

  return {
    filters,
    updateKeyword,
    toggleSkill,
    toggleLanguage,
    toggleField,
    setVerifiedFilter,
    setYearRange,
    resetFilters,
    hasActiveFilters,
  };
};
