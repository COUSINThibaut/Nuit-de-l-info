import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Mail, Lock, User, AlertCircle, Check, X, Eye, EyeOff } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Calculate password strength
  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    setPasswordStrength(strength);
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-orange-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 1) return 'Faible';
    if (passwordStrength === 2) return 'Moyen';
    if (passwordStrength === 3) return 'Bon';
    return 'Excellent';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordStrength < 2) {
      setError('Le mot de passe est trop faible');
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:3023/api');
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      login(data.token, data.user);
      navigate('/add');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-surface p-8 rounded-2xl shadow-2xl border border-white/10 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-secondary-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-secondary-500/30">
            <UserPlus className="text-secondary-500" size={32} />
          </div>
          <h1 className="text-3xl font-display font-bold text-text">Inscription</h1>
          <p className="text-text-muted mt-2">Rejoignez la communauté</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-center gap-3 text-red-400 animate-shake">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text/80 mb-2">Nom complet</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition text-text placeholder-text/30"
                placeholder="Jean Dupont"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text/80 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition text-text placeholder-text/30"
                placeholder="votre@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text/80 mb-2">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-background/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition text-text placeholder-text/30"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-text-muted">Force du mot de passe:</span>
                  <span className={`font-medium ${getStrengthColor().replace('bg-', 'text-')}`}>
                    {getStrengthText()}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${getStrengthColor()}`} 
                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-text-muted mt-2">
                  <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-400' : ''}`}>
                    {password.length >= 8 ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-current" />}
                    8 caractères min.
                  </div>
                  <div className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-400' : ''}`}>
                    {/[A-Z]/.test(password) ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-current" />}
                    Majuscule
                  </div>
                  <div className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-400' : ''}`}>
                    {/[0-9]/.test(password) ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-current" />}
                    Chiffre
                  </div>
                  <div className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(password) ? 'text-green-400' : ''}`}>
                    {/[^A-Za-z0-9]/.test(password) ? <Check size={12} /> : <div className="w-3 h-3 rounded-full border border-current" />}
                    Caractère spécial
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text/80 mb-2">Confirmer le mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-10 pr-20 py-3 bg-background/50 border rounded-xl focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition text-text placeholder-text/30 ${
                  confirmPassword && password !== confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-white/10'
                }`}
                placeholder="••••••••"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {confirmPassword && (
                  <>
                    {password === confirmPassword ? (
                      <Check className="text-green-500" size={20} />
                    ) : (
                      <X className="text-red-500" size={20} />
                    )}
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-text-muted hover:text-text transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-secondary-600 text-white rounded-xl font-semibold hover:bg-secondary-500 transition shadow-lg hover:shadow-secondary-600/30 mt-4"
          >
            S'inscrire
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-text-muted">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-secondary-400 hover:text-secondary-300 font-medium">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
};
