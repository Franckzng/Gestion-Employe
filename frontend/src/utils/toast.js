// frontend/src/utils/toast.js

/**
 * Afficher un toast de succès
 * @param {string} message - Message à afficher
 * @param {number} duration - Durée en ms (défaut: 3000)
 */
export const showSuccess = (message, duration = 3000) => {
  if (window.showToast) {
    window.showToast(message, 'success', duration);
  }
};

/**
 * Afficher un toast d'erreur
 * @param {string} message - Message à afficher
 * @param {number} duration - Durée en ms (défaut: 4000)
 */
export const showError = (message, duration = 4000) => {
  if (window.showToast) {
    window.showToast(message, 'error', duration);
  }
};

/**
 * Afficher un toast d'avertissement
 * @param {string} message - Message à afficher
 * @param {number} duration - Durée en ms (défaut: 3500)
 */
export const showWarning = (message, duration = 3500) => {
  if (window.showToast) {
    window.showToast(message, 'warning', duration);
  }
};

/**
 * Afficher un toast d'information
 * @param {string} message - Message à afficher
 * @param {number} duration - Durée en ms (défaut: 3000)
 */
export const showInfo = (message, duration = 3000) => {
  if (window.showToast) {
    window.showToast(message, 'info', duration);
  }
};

/**
 * Afficher un toast personnalisé
 * @param {string} message - Message à afficher
 * @param {string} type - Type (success, error, warning, info)
 * @param {number} duration - Durée en ms
 */
export const showToast = (message, type = 'info', duration = 3000) => {
  if (window.showToast) {
    window.showToast(message, type, duration);
  }
};

export default {
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  show: showToast
};