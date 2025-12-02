// frontend/src/services/attendanceService.js

import api from './api';

const attendanceService = {
  // Pointer l'arrivée
  checkIn: async () => {
    const response = await api.post('/attendance/check-in');
    return response.data;
  },

  // Pointer le départ
  checkOut: async () => {
    const response = await api.post('/attendance/check-out');
    return response.data;
  },

  // Obtenir le pointage du jour
  getToday: async () => {
    const response = await api.get('/attendance/today');
    return response.data;
  },

  // Obtenir toutes les présences
  getAll: async (params = {}) => {
    const response = await api.get('/attendance', { params });
    return response.data;
  },

  // Obtenir les présences d'un employé
  getByEmployee: async (employeeId, params = {}) => {
    const response = await api.get(`/attendance/employee/${employeeId}`, { params });
    return response.data;
  },

  // Créer/Modifier une présence manuellement
  createManual: async (attendanceData) => {
    const response = await api.post('/attendance/manual', attendanceData);
    return response.data;
  },

  // Supprimer une présence
  delete: async (id) => {
    const response = await api.delete(`/attendance/${id}`);
    return response.data;
  },
};

export default attendanceService;