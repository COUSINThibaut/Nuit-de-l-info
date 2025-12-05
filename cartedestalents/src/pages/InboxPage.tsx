import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Check, X, User, Clock, Inbox as InboxIcon, Send } from 'lucide-react';

interface ConnectionRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  fromUserAvatar?: string;
  studentId?: number;
  createdAt: string;
}

interface OutgoingRequest {
  id: string;
  toUserId: string;
  toUserName: string;
  toUserAvatar?: string;
  studentId?: number;
  createdAt: string;
  status: string;
}

export const InboxPage: React.FC = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<OutgoingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
    fetchOutgoingRequests();
  }, [token]);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/connections/incoming`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      setError('Impossible de charger les demandes');
    } finally {
      setLoading(false);
    }
  };

  const fetchOutgoingRequests = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/connections/outgoing`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch outgoing requests');
      const data = await response.json();
      setOutgoingRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAction = async (id: string, status: 'accepted' | 'rejected') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/connections/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Action failed');

      // Remove from list
      setRequests(prev => prev.filter(req => req.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-text flex items-center gap-3">
          <InboxIcon className="text-primary-500" size={32} />
          Boîte de réception
        </h1>
        <p className="text-text-muted mt-2">Gérez vos demandes de connexion</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab('incoming')}
          className={`pb-3 px-2 font-medium transition relative ${
            activeTab === 'incoming' ? 'text-primary-500' : 'text-text-muted hover:text-text'
          }`}
        >
          Reçues ({requests.length})
          {activeTab === 'incoming' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 rounded-t-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('outgoing')}
          className={`pb-3 px-2 font-medium transition relative ${
            activeTab === 'outgoing' ? 'text-primary-500' : 'text-text-muted hover:text-text'
          }`}
        >
          Envoyées ({outgoingRequests.length})
          {activeTab === 'outgoing' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 rounded-t-full"></div>
          )}
        </button>
      </div>

      {activeTab === 'incoming' ? (
        requests.length === 0 ? (
          <div className="bg-surface border border-white/10 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <InboxIcon className="text-text-muted" size={32} />
            </div>
            <h3 className="text-xl font-bold text-text mb-2">Aucune demande reçue</h3>
            <p className="text-text-muted">Vous n'avez pas de nouvelles demandes de connexion pour le moment.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => (
              <div key={request.id} className="bg-surface border border-white/10 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 animate-fade-in">
                <div className="relative">
                  <img 
                    src={request.fromUserAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.fromUserName)}&background=random`}
                    alt={request.fromUserName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
                  />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-bold text-text">{request.fromUserName}</h3>
                  <p className="text-text-muted text-sm mb-2">{request.fromUserEmail}</p>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-text-muted">
                    <Clock size={14} />
                    <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {request.studentId && (
                    <Link 
                      to={`/profile/${request.studentId}`}
                      className="flex-1 md:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 text-text rounded-lg font-medium transition text-center"
                    >
                      Voir profil
                    </Link>
                  )}
                  <button
                    onClick={() => handleAction(request.id, 'accepted')}
                    className="flex-1 md:flex-none px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <Check size={18} />
                    <span className="md:hidden">Accepter</span>
                  </button>
                  <button
                    onClick={() => handleAction(request.id, 'rejected')}
                    className="flex-1 md:flex-none px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <X size={18} />
                    <span className="md:hidden">Refuser</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        outgoingRequests.length === 0 ? (
          <div className="bg-surface border border-white/10 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="text-text-muted" size={32} />
            </div>
            <h3 className="text-xl font-bold text-text mb-2">Aucune demande envoyée</h3>
            <p className="text-text-muted">Vous n'avez pas de demandes en attente.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {outgoingRequests.map((request) => (
              <div key={request.id} className="bg-surface border border-white/10 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 animate-fade-in">
                <div className="relative">
                  <img 
                    src={request.toUserAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(request.toUserName)}&background=random`}
                    alt={request.toUserName}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
                  />
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-bold text-text">{request.toUserName}</h3>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-text-muted mt-2">
                    <Clock size={14} />
                    <span>Envoyée le {new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {request.studentId && (
                    <Link 
                      to={`/profile/${request.studentId}`}
                      className="flex-1 md:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 text-text rounded-lg font-medium transition text-center"
                    >
                      Voir profil
                    </Link>
                  )}
                  <span className="px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-lg font-medium text-sm border border-yellow-500/20">
                    En attente
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};
