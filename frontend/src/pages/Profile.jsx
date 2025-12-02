// frontend/src/pages/Profile.jsx

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';
import { User, Lock, Mail, Phone, MapPin, Briefcase, Calendar } from 'lucide-react';
import { formatDate } from '../utils/helpers';

const Profile = () => {
  const { user } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white text-3xl font-bold">
              {user?.employee?.firstName?.[0]}{user?.employee?.lastName?.[0]}
            </span>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {user?.employee?.firstName} {user?.employee?.lastName}
            </h2>
            <p className="text-gray-600 mb-4">{user?.employee?.position}</p>
            
            <div className="flex items-center space-x-4">
              <span className="badge badge-info capitalize">
                {user?.role?.toLowerCase()}
              </span>
              <span className={`badge ${user?.employee?.isActive ? 'badge-success' : 'badge-danger'}`}>
                {user?.employee?.isActive ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setShowPasswordModal(true)}
            className="btn btn-secondary"
          >
            <Lock className="w-4 h-4 mr-2" />
            Changer mot de passe
          </button>
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Informations Personnelles
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>

            {user?.employee?.phone && (
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-medium">{user.employee.phone}</p>
                </div>
              </div>
            )}

            {user?.employee?.address && (
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Adresse</p>
                  <p className="font-medium">{user.employee.address}</p>
                </div>
              </div>
            )}

            {user?.employee?.birthDate && (
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Date de naissance</p>
                  <p className="font-medium">{formatDate(user.employee.birthDate)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Professional Info */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Briefcase className="w-5 h-5 mr-2" />
            Informations Professionnelles
          </h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Poste</p>
              <p className="font-medium">{user?.employee?.position}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Département</p>
              <p className="font-medium">{user?.employee?.department}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Date d'embauche</p>
              <p className="font-medium">{formatDate(user?.employee?.hireDate)}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Ancienneté</p>
              <p className="font-medium">
                {Math.floor((new Date() - new Date(user?.employee?.hireDate)) / (1000 * 60 * 60 * 24 * 365))} ans
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <PasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  );
};

// Password Change Modal
const PasswordModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      await authService.changePassword(formData.currentPassword, formData.newPassword);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Changer le mot de passe</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                Mot de passe modifié avec succès !
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Mot de passe actuel</label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="input"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="label">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onClose} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? 'Modification...' : 'Modifier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;