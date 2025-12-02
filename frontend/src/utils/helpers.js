// frontend/src/utils/helpers.js

import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formater une date
 * @param {string|Date} date - Date à formater
 * @param {string} formatStr - Format souhaité (default: 'dd/MM/yyyy')
 * @returns {string} - Date formatée
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
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
export const formatTime = (time) => {
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
 * Formater une date avec l'heure
 * @param {string|Date} datetime - DateTime à formater
 * @returns {string} - DateTime formatée
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return '-';
  
  try {
    const dateObj = typeof datetime === 'string' ? parseISO(datetime) : datetime;
    return format(dateObj, 'dd/MM/yyyy HH:mm', { locale: fr });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return '-';
  }
};

/**
 * Formater un nombre en devise
 * @param {number} amount - Montant
 * @param {string} currency - Devise (default: 'XOF')
 * @returns {string} - Montant formaté
 */
export const formatCurrency = (amount, currency = 'XOF') => {
  if (amount === null || amount === undefined) return '-';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

/**
 * Obtenir le nom du mois en français
 * @param {number} monthIndex - Index du mois (0-11)
 * @returns {string} - Nom du mois
 */
export const getMonthName = (monthIndex) => {
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return months[monthIndex];
};

/**
 * Calculer le nombre de jours entre deux dates
 * @param {string|Date} startDate - Date de début
 * @param {string|Date} endDate - Date de fin
 * @returns {number} - Nombre de jours
 */
export const daysBetween = (startDate, endDate) => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Valider un email
 * @param {string} email - Email à valider
 * @returns {boolean} - True si valide
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valider un numéro de téléphone
 * @param {string} phone - Téléphone à valider
 * @returns {boolean} - True si valide
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]{8,}$/;
  return phoneRegex.test(phone);
};

/**
 * Tronquer un texte
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} - Texte tronqué
 */
export const truncate = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Obtenir les initiales d'un nom
 * @param {string} firstName - Prénom
 * @param {string} lastName - Nom
 * @returns {string} - Initiales
 */
export const getInitials = (firstName, lastName) => {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
};

/**
 * Générer une couleur aléatoire
 * @returns {string} - Couleur hexadécimale
 */
export const randomColor = () => {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Débounce une fonction
 * @param {Function} func - Fonction à debouncer
 * @param {number} wait - Délai en ms
 * @returns {Function} - Fonction debouncée
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Capitaliser la première lettre
 * @param {string} str - Chaîne à capitaliser
 * @returns {string} - Chaîne capitalisée
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Vérifier si un objet est vide
 * @param {Object} obj - Objet à vérifier
 * @returns {boolean} - True si vide
 */
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};