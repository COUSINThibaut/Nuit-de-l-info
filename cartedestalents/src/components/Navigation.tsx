import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, UserPlus, Users, LogIn, LogOut, User, Settings, Edit, ShieldCheck, ChevronDown, Inbox } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import logo from '../assets/logo.png';

/**
 * Composant de navigation principale
 */
export const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { path: '/', label: 'Accueil', icon: Home },
    { path: '/search', label: 'Rechercher', icon: Search },
    { path: '/talents', label: 'Talents', icon: Users },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="Logo" className="w-14 h-14 object-contain group-hover:scale-105 transition-transform" />
            <span className="font-display font-bold text-xl text-text hidden sm:block tracking-tight">
              La Carte Des <span className="text-primary-500">Talents</span>
            </span>
          </Link>

          {/* Navigation principale */}
          <div className="flex items-center gap-1 md:gap-2">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`
                    flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300
                    ${isActive 
                      ? 'bg-primary-600/10 text-primary-500 border border-primary-600/20' 
                      : 'text-text-muted hover:bg-white/5 hover:text-text'
                    }
                  `}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              );
            })}

            {isAuthenticated ? (
              <>
                <Link
                  to="/inbox"
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-300
                    ${location.pathname === '/inbox'
                      ? 'bg-primary-600/10 text-primary-500 border border-primary-600/20' 
                      : 'text-text-muted hover:bg-white/5 hover:text-text'
                    }
                  `}
                  title="Boîte de réception"
                >
                  <Inbox size={18} />
                </Link>

                <div className="h-6 w-px bg-white/10 mx-2"></div>
                
                {/* User Menu Dropdown */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-500 border border-primary-500/30">
                      <User size={16} />
                    </div>
                    <span className="text-sm text-text font-medium hidden md:block">
                      {user?.name}
                    </span>
                    <ChevronDown size={16} className={`text-text-muted transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-surface border border-white/10 rounded-xl shadow-xl py-2 animate-scale-in z-50">
                      <div className="px-4 py-2 border-b border-white/5 mb-1">
                        <p className="text-sm font-medium text-text">{user?.name}</p>
                        <p className="text-xs text-text-muted truncate">{user?.email}</p>
                      </div>
                      
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-text-muted hover:text-text hover:bg-white/5 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings size={16} />
                        Paramètres du compte
                      </Link>
                      
                      <Link
                        to="/edit-profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-text-muted hover:text-text hover:bg-white/5 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Edit size={16} />
                        Modifier ma carte
                      </Link>
                      
                      <div className="h-px bg-white/5 my-1"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                      >
                        <LogOut size={16} />
                        Se déconnecter
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="h-6 w-px bg-white/10 mx-2"></div>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg font-medium text-sm hover:bg-primary-500 transition shadow-lg hover:shadow-primary-600/20"
                >
                  <LogIn size={18} />
                  <span className="hidden sm:inline">Connexion</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
