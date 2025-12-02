// frontend/src/pages/Leaves.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import leaveService from '../services/leaveService';
import Modal from '../components/common/Modal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Plus, Calendar, Check, X, Clock } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import toast from '../utils/toast';

const Leaves = () => {
  const { user, isAdmin } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    loadLeaves();
  }, [filter]);

  const loadLeaves = async () => {
    try {
      const params = filter ? { status: filter } : {};
      
      if (isAdmin()) {
        const response = await leaveService.getAll(params);
        setLeaves(response.leaveRequests);
      } else {
        const response = await leaveService.getMyRequests(params);
        setLeaves(response.leaveRequests);
      }
    } catch (error) {
      console.error('Error loading leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    if (window.confirm(`Êtes-vous sûr de vouloir ${status === 'APPROVED' ? 'approuver' : 'rejeter'} cette demande ?`)) {
      try {
        await leaveService.review(id, status);
        loadLeaves();
        toast.success(`Demande ${status === 'APPROVED' ? 'approuvée' : 'rejetée'} avec succès`);
      } catch (error) {
        toast.error('Erreur lors du traitement de la demande');
      }
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) {
      try {
        await leaveService.cancel(id);
        loadLeaves();
        toast.success('Demande annulée avec succès');
      } catch (error) {
        toast.error('Erreur lors de l\'annulation');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'PENDING').length,
    approved: leaves.filter(l => l.status === 'APPROVED').length,
    rejected: leaves.filter(l => l.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-6 pt-16">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Demandes de Congé</h1>
        {!isAdmin() && (
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Demande
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Attente</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approuvées</p>
              <p className="text-2xl font-bold">{stats.approved}</p>
            </div>
            <Check className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejetées</p>
              <p className="text-2xl font-bold">{stats.rejected}</p>
            </div>
            <X className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('')}
            className={`px-4 py-2 rounded-lg ${!filter ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}
          >
            Toutes
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-4 py-2 rounded-lg ${filter === 'PENDING' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}
          >
            En attente
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className={`px-4 py-2 rounded-lg ${filter === 'APPROVED' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}
          >
            Approuvées
          </button>
          <button
            onClick={() => setFilter('REJECTED')}
            className={`px-4 py-2 rounded-lg ${filter === 'REJECTED' ? 'bg-primary-600 text-white' : 'bg-gray-100'}`}
          >
            Rejetées
          </button>
        </div>
      </div>

      {/* Leaves List */}
      <div className="grid grid-cols-1 gap-4">
        {leaves.map((leave) => (
          <div key={leave.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  {isAdmin() && leave.employee && (
                    <>
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {leave.employee.firstName[0]}{leave.employee.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {leave.employee.firstName} {leave.employee.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{leave.employee.department}</p>
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Type de congé</p>
                    <p className="font-medium capitalize">{leave.leaveType.toLowerCase()}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Période</p>
                    <p className="font-medium">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Raison</p>
                    <p className="text-gray-900">{leave.reason}</p>
                  </div>

                  {leave.reviewNotes && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Notes de révision</p>
                      <p className="text-gray-900">{leave.reviewNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end space-y-3">
                <span className={`badge ${
                  leave.status === 'APPROVED' ? 'badge-success' :
                  leave.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'
                }`}>
                  {leave.status === 'APPROVED' ? 'Approuvée' :
                   leave.status === 'REJECTED' ? 'Rejetée' : 'En attente'}
                </span>

                {isAdmin() && leave.status === 'PENDING' && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReview(leave.id, 'APPROVED')}
                      className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleReview(leave.id, 'REJECTED')}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {!isAdmin() && leave.status === 'PENDING' && (
                  <button
                    onClick={() => handleCancel(leave.id)}
                    className="btn btn-danger btn-sm"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {leaves.length === 0 && (
          <div className="card text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune demande de congé</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <LeaveModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            loadLeaves();
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

// Leave Request Modal
const LeaveModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    leaveType: 'VACATION',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await leaveService.create(formData);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Nouvelle demande de congé">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            {error}
          </div>
        )}

        <div>
          <label className="label">Type de congé *</label>
          <select
            value={formData.leaveType}
            onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
            className="input"
            required
          >
            <option value="VACATION">Vacances</option>
            <option value="SICK">Maladie</option>
            <option value="PERSONAL">Personnel</option>
            <option value="MATERNITY">Maternité</option>
            <option value="PATERNITY">Paternité</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Date de début *</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="input"
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div>
            <label className="label">Date de fin *</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="input"
              required
              min={formData.startDate || new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div>
          <label className="label">Raison *</label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="input"
            rows="4"
            required
            placeholder="Décrivez la raison de votre demande..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Annuler
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? 'Envoi...' : 'Envoyer la demande'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default Leaves;