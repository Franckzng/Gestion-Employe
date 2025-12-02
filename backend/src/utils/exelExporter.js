// backend/src/utils/excelExporter.js

const XLSX = require('xlsx');
const { formatDate } = require('./formatters');

/**
 * Exporter les présences en Excel
 * @param {Array} attendances - Liste des présences
 * @param {Object} options - Options d'export
 * @returns {Buffer} - Fichier Excel en buffer
 */
const exportAttendancesToExcel = (attendances, options = {}) => {
  try {
    // Préparer les données
    const data = attendances.map(att => ({
      'Employé': `${att.employee.firstName} ${att.employee.lastName}`,
      'Département': att.employee.department,
      'Date': formatDate(att.date),
      'Arrivée': att.checkIn ? new Date(att.checkIn).toLocaleTimeString('fr-FR') : '-',
      'Départ': att.checkOut ? new Date(att.checkOut).toLocaleTimeString('fr-FR') : '-',
      'Heures Travaillées': att.workHours || 0,
      'Statut': att.status,
      'Notes': att.notes || '-'
    }));

    // Créer une feuille de calcul
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Ajuster la largeur des colonnes
    const columnWidths = [
      { wch: 25 }, // Employé
      { wch: 20 }, // Département
      { wch: 12 }, // Date
      { wch: 10 }, // Arrivée
      { wch: 10 }, // Départ
      { wch: 15 }, // Heures
      { wch: 12 }, // Statut
      { wch: 30 }  // Notes
    ];
    worksheet['!cols'] = columnWidths;

    // Créer un classeur
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Présences');

    // Générer le buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return buffer;
  } catch (error) {
    console.error('Error exporting attendances to Excel:', error);
    throw error;
  }
};

/**
 * Exporter les employés en Excel
 * @param {Array} employees - Liste des employés
 * @returns {Buffer} - Fichier Excel en buffer
 */
const exportEmployeesToExcel = (employees) => {
  try {
    const data = employees.map(emp => ({
      'ID': emp.id,
      'Prénom': emp.firstName,
      'Nom': emp.lastName,
      'Email': emp.user?.email || '-',
      'Téléphone': emp.phone || '-',
      'Poste': emp.position,
      'Département': emp.department,
      'Date d\'embauche': formatDate(emp.hireDate),
      'Date de naissance': emp.birthDate ? formatDate(emp.birthDate) : '-',
      'Adresse': emp.address || '-',
      'Salaire': emp.salary || '-',
      'Statut': emp.isActive ? 'Actif' : 'Inactif',
      'Rôle': emp.user?.role || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const columnWidths = [
      { wch: 35 }, // ID
      { wch: 15 }, // Prénom
      { wch: 15 }, // Nom
      { wch: 25 }, // Email
      { wch: 15 }, // Téléphone
      { wch: 25 }, // Poste
      { wch: 20 }, // Département
      { wch: 15 }, // Date embauche
      { wch: 15 }, // Date naissance
      { wch: 30 }, // Adresse
      { wch: 12 }, // Salaire
      { wch: 10 }, // Statut
      { wch: 12 }  // Rôle
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employés');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return buffer;
  } catch (error) {
    console.error('Error exporting employees to Excel:', error);
    throw error;
  }
};

/**
 * Exporter les demandes de congé en Excel
 * @param {Array} leaves - Liste des demandes
 * @returns {Buffer} - Fichier Excel en buffer
 */
const exportLeavesToExcel = (leaves) => {
  try {
    const data = leaves.map(leave => ({
      'ID': leave.id,
      'Employé': leave.employee ? `${leave.employee.firstName} ${leave.employee.lastName}` : '-',
      'Département': leave.employee?.department || '-',
      'Type de congé': leave.leaveType,
      'Date début': formatDate(leave.startDate),
      'Date fin': formatDate(leave.endDate),
      'Raison': leave.reason,
      'Statut': leave.status,
      'Demandé le': formatDate(leave.createdAt),
      'Révisé le': leave.reviewedAt ? formatDate(leave.reviewedAt) : '-',
      'Notes de révision': leave.reviewNotes || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    const columnWidths = [
      { wch: 35 }, // ID
      { wch: 25 }, // Employé
      { wch: 20 }, // Département
      { wch: 15 }, // Type
      { wch: 12 }, // Date début
      { wch: 12 }, // Date fin
      { wch: 40 }, // Raison
      { wch: 12 }, // Statut
      { wch: 12 }, // Demandé le
      { wch: 12 }, // Révisé le
      { wch: 40 }  // Notes
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Demandes de Congé');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return buffer;
  } catch (error) {
    console.error('Error exporting leaves to Excel:', error);
    throw error;
  }
};

/**
 * Créer un rapport Excel avec plusieurs feuilles
 * @param {Object} data - Données à exporter
 * @returns {Buffer} - Fichier Excel en buffer
 */
const createMultiSheetReport = (data) => {
  try {
    const workbook = XLSX.utils.book_new();

    // Ajouter la feuille des employés
    if (data.employees && data.employees.length > 0) {
      const empData = data.employees.map(emp => ({
        'Nom': `${emp.firstName} ${emp.lastName}`,
        'Poste': emp.position,
        'Département': emp.department,
        'Statut': emp.isActive ? 'Actif' : 'Inactif'
      }));
      const empSheet = XLSX.utils.json_to_sheet(empData);
      XLSX.utils.book_append_sheet(workbook, empSheet, 'Employés');
    }

    // Ajouter la feuille des présences
    if (data.attendances && data.attendances.length > 0) {
      const attData = data.attendances.map(att => ({
        'Employé': `${att.employee.firstName} ${att.employee.lastName}`,
        'Date': formatDate(att.date),
        'Statut': att.status,
        'Heures': att.workHours || 0
      }));
      const attSheet = XLSX.utils.json_to_sheet(attData);
      XLSX.utils.book_append_sheet(workbook, attSheet, 'Présences');
    }

    // Ajouter la feuille des statistiques
    if (data.statistics) {
      const statsData = [
        { 'Métrique': 'Total Employés', 'Valeur': data.statistics.totalEmployees || 0 },
        { 'Métrique': 'Employés Actifs', 'Valeur': data.statistics.activeEmployees || 0 },
        { 'Métrique': 'Présences Aujourd\'hui', 'Valeur': data.statistics.todayPresent || 0 },
        { 'Métrique': 'Absences Aujourd\'hui', 'Valeur': data.statistics.todayAbsent || 0 }
      ];
      const statsSheet = XLSX.utils.json_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Statistiques');
    }

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return buffer;
  } catch (error) {
    console.error('Error creating multi-sheet report:', error);
    throw error;
  }
};

module.exports = {
  exportAttendancesToExcel,
  exportEmployeesToExcel,
  exportLeavesToExcel,
  createMultiSheetReport,
};