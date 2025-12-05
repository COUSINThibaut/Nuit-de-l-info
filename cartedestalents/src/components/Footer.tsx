import React from 'react';
import { Heart, Github } from 'lucide-react';

/**
 * Composant Footer
 */
export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-white/5 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* À propos */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4 text-text">Carte des Talents</h3>
            <p className="text-text-muted text-sm">
              Plateforme de mise en relation entre étudiants talentueux. 
              Découvrez des compétences, connectez-vous et collaborez.
            </p>
          </div>

          {/* Navigation rapide */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4 text-text">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/" className="text-text-muted hover:text-primary-500 transition">
                  Accueil
                </a>
              </li>
              <li>
                <a href="/search" className="text-text-muted hover:text-primary-500 transition">
                  Rechercher des talents
                </a>
              </li>
              <li>
                <a href="/talents" className="text-text-muted hover:text-primary-500 transition">
                  Tous les talents
                </a>
              </li>
              <li>
                <a href="/add" className="text-text-muted hover:text-primary-500 transition">
                  Créer un profil
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Contact</h3>
            <p className="text-neutral-400 text-sm mb-4">
              Une initiative étudiante pour le Défi National "Nuit de l'Info".
            </p>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition"
            >
              <Github size={18} />
              <span className="text-sm">Voir sur GitHub</span>
            </a>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-sm text-neutral-400">
          <p className="flex items-center justify-center gap-2">
            Fait avec <Heart size={16} className="text-red-500" /> pour la Nuit de l'Info 2025
          </p>
        </div>
      </div>
    </footer>
  );
};
