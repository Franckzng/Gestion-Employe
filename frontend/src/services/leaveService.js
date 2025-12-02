// frontend/src/services/leaveService.js

import api from './api';

const leaveService = {
  // Créer une demande de congé
  create: async (leaveData) => {
    const response = await api.post('/leaves', leaveData);
    return response.data;
  },

  // Obtenir toutes les demandes
  getAll: async (params = {}) => {
    const response = await api.get('/leaves', { params });
    return response.data;
  },

  // Obtenir mes demandes
  getMyRequests: async (params = {}) => {
    const response = await api.get('/leaves/my-requests', { params });
    return response.data;
  },

  // Obtenir une demande par ID
  getById: async (id) => {
    const response = await api.get(`/leaves/${id}`);
    return response.data;
  },

  // Approuver/Rejeter une demande
  review: async (id, status, reviewNotes = '') => {
    const response = await api.put(`/leaves/${id}/review`, { status, reviewNotes });
    return response.data;
  },

  // Annuler une demande
  cancel: async (id) => {
    const response = await api.delete(`/leaves/${id}`);
    return response.data;
  },

  // Obtenir les statistiques de congés
  getStats: async (employeeId, params = {}) => {
    const response = await api.get(`/leaves/stats/${employeeId}`, { params });
    return response.data;
  },
};

export default leaveService;