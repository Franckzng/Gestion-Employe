// frontend/src/services/dashboardService.js

import api from './api';

const dashboardService = {
  // Obtenir le tableau de bord admin
  getAdminDashboard: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  // Obtenir le tableau de bord employé
  getEmployeeDashboard: async () => {
    const response = await api.get('/dashboard/employee');
    return response.data;
  },
};

export default dashboardService;