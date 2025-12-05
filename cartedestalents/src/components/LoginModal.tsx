import React from 'react';
import { X, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-primary-50 rounded-full flex items-center justify-center">
            <LogIn className="w-6 h-6 text-primary-600" />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Connexion requise
          </h3>
          
          <p className="text-gray-600 mb-6">
            Vous devez être connecté pour contacter ce talent. Rejoignez la communauté pour échanger avec d'autres étudiants !
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => navigate('/login')}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm shadow-primary-600/20"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
