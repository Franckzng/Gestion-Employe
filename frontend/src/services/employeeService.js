// frontend/src/services/employeeService.js

import api from './api';

const employeeService = {
  // Obtenir tous les employés
  getAll: async (params = {}) => {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  // Obtenir un employé par ID
  getById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  // Créer un employé
  create: async (employeeData) => {
    const response = await api.post('/employees', employeeData);
    return response.data;
  },

  // Mettre à jour un employé
  update: async (id, employeeData) => {
    const response = await api.put(`/employees/${id}`, employeeData);
    return response.data;
  },

  // Supprimer un employé
  delete: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  // Obtenir les statistiques d'un employé
  getStats: async (id, params = {}) => {
    const response = await api.get(`/employees/${id}/stats`, { params });
    return response.data;
  },
};

export default employeeService;