import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { User, Mail, ShieldCheck, Save, AlertCircle, Check, Lock, Bell, Smartphone, ToggleLeft, ToggleRight } from 'lucide-react';

type SettingsTab = 'profile' | 'security' | 'notifications';

export const SettingsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await updateUser(name, email);
      setSuccess('Profil mis à jour avec succès !');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'security':
        return (
          <div className="bg-surface border border-white/10 rounded-xl p-6 md:p-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-500 border border-primary-500/30">
                <Lock size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text">Sécurité</h2>
                <p className="text-sm text-text-muted">Gérez la sécurité de votre compte</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-white/5">
                <div className="space-y-1">
                  <h3 className="font-medium text-text">Authentification à deux facteurs (A2F)</h3>
                  <p className="text-sm text-text-muted">Ajoutez une couche de sécurité supplémentaire à votre compte</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-primary-500/10 text-primary-400 text-xs font-medium rounded border border-primary-500/20">
                    Bientôt disponible
                  </span>
                  <button disabled className="opacity-50 cursor-not-allowed text-text-muted">
                    <ToggleLeft size={40} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="bg-surface border border-white/10 rounded-xl p-6 md:p-8 animate-fade-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-500 border border-primary-500/30">
                <Bell size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-text">Notifications</h2>
                <p className="text-sm text-text-muted">Gérez vos préférences de notification</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-white/5">
                <div className="space-y-1">
                  <h3 className="font-medium text-text">Demandes de contact</h3>
                  <p className="text-sm text-text-muted">Recevoir les demandes de contact par email</p>
                </div>
                <button 
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`transition-colors ${emailNotifications ? 'text-primary-500' : 'text-text-muted'}`}
                >
                  {emailNotifications ? <ToggleRight size={40} /> : <ToggleLeft size={40} />}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-6 animate-fade-in">
            {/* Personal Info Card */}
            <div className="bg-surface border border-white/10 rounded-xl p-6 md:p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-500 border border-primary-500/30">
                  <User size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text">Informations personnelles</h2>
                  <p className="text-sm text-text-muted">Mettez à jour vos informations d'identification</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text/80">Nom complet</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-text"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-text/80">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-white/10 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-text"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-500 transition shadow-lg hover:shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    <span>Enregistrer</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Verification Card */}
            <div className="bg-surface border border-white/10 rounded-xl p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-secondary-500/20 rounded-lg text-secondary-500">
                  <ShieldCheck size={24} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-text">Vérification du profil</h3>
                    <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-medium rounded border border-yellow-500/20">
                      Non vérifié
                    </span>
                  </div>
                  <p className="text-text-muted text-sm mb-4">
                    Faites vérifier votre profil pour obtenir le badge officiel et augmenter votre visibilité auprès des recruteurs.
                    Cela nécessite une validation de votre adresse email étudiante.
                  </p>
                  <button 
                    onClick={() => setSuccess('Demande de vérification envoyée !')}
                    className="px-4 py-2 bg-secondary-600/20 text-secondary-400 border border-secondary-600/30 rounded-lg text-sm font-medium hover:bg-secondary-600/30 transition flex items-center gap-2"
                  >
                    <Smartphone size={16} />
                    Demander la vérification
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text">Paramètres du compte</h1>
        <p className="text-text-muted mt-2">Gérez vos informations personnelles et vos préférences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'profile' 
                ? 'bg-primary-600/10 text-primary-500 border border-primary-600/20' 
                : 'text-text-muted hover:bg-white/5 hover:text-text'
            }`}
          >
            <User size={20} />
            <span>Profil Public</span>
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'security' 
                ? 'bg-primary-600/10 text-primary-500 border border-primary-600/20' 
                : 'text-text-muted hover:bg-white/5 hover:text-text'
            }`}
          >
            <Lock size={20} />
            <span>Sécurité</span>
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'notifications' 
                ? 'bg-primary-600/10 text-primary-500 border border-primary-600/20' 
                : 'text-text-muted hover:bg-white/5 hover:text-text'
            }`}
          >
            <Bell size={20} />
            <span>Notifications</span>
          </button>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3 text-green-400 animate-fade-in">
              <Check size={20} />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3 text-red-400 animate-shake">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {renderContent()}
        </div>
      </div>
    </div>
  );
};
