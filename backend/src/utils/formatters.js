// backend/src/utils/formatters.js

const { format, parseISO } = require('date-fns');
const { fr } = require('date-fns/locale');

/**
 * Formater une date
 * @param {string|Date} date - Date à formater
 * @param {string} formatStr - Format (défaut: dd/MM/yyyy)
 * @returns {string} - Date formatée
 */
const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '-';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: fr });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
};

/**
 * Formater une heure
 * @param {string|Date} time - Heure à formater
 * @returns {string} - Heure formatée
 */
const formatTime = (time) => {
  if (!time) return '-';
  
  try {
    const timeObj = typeof time === 'string' ? parseISO(time) : time;
    return format(timeObj, 'HH:mm', { locale: fr });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '-';
  }
};

/**
 * Formater un montant en devise
 * @param {number} amount - Montant
 * @param {string} currency - Devise (défaut: FCFA)
 * @returns {string} - Montant formaté
 */
const formatCurrency = (amount, currency = 'FCFA') => {
  if (amount === null || amount === undefined) return '-';
  
  return `${amount.toLocaleString('fr-FR')} ${currency}`;
};

/**
 * Formater le statut de présence
 * @param {string} status - Statut
 * @returns {string} - Statut formaté
 */
const formatAttendanceStatus = (status) => {
  const statusMap = {
    PRESENT: 'Présent',
    ABSENT: 'Absent',
    LATE: 'En retard',
    HALF_DAY: 'Demi-journée'
  };
  
  return statusMap[status] || status;
};

/**
 * Formater le statut de congé
 * @param {string} status - Statut
 * @returns {string} - Statut formaté
 */
const formatLeaveStatus = (status) => {
  const statusMap = {
    PENDING: 'En attente',
    APPROVED: 'Approuvé',
    REJECTED: 'Rejeté'
  };
  
  return statusMap[status] || status;
};

/**
 * Formater le type de congé
 * @param {string} type - Type
 * @returns {string} - Type formaté
 */
const formatLeaveType = (type) => {
  const typeMap = {
    SICK: 'Maladie',
    VACATION: 'Vacances',
    PERSONAL: 'Personnel',
    MATERNITY: 'Maternité',
    PATERNITY: 'Paternité'
  };
  
  return typeMap[type] || type;
};

/**
 * Formater le rôle
 * @param {string} role - Rôle
 * @returns {string} - Rôle formaté
 */
const formatRole = (role) => {
  const roleMap = {
    ADMIN: 'Administrateur',
    HR: 'Ressources Humaines',
    EMPLOYEE: 'Employé'
  };
  
  return roleMap[role] || role;
};

/**
 * Calculer la durée entre deux dates en jours
 * @param {Date|string} startDate - Date de début
 * @param {Date|string} endDate - Date de fin
 * @returns {number} - Nombre de jours
 */
const calculateDaysBetween = (startDate, endDate) => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

module.exports = {
  formatDate,
  formatTime,
  formatCurrency,
  formatAttendanceStatus,
  formatLeaveStatus,
  formatLeaveType,
  formatRole,
  calculateDaysBetween,
};