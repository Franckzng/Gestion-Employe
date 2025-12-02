// frontend/src/utils/exportUtils.js

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Exporter des données en Excel
 * @param {Array} data - Données à exporter (tableau d'objets)
 * @param {string} filename - Nom du fichier (sans extension)
 */
export const exportToExcel = (data, filename = 'export') => {
  try {
    // Créer une nouvelle feuille de calcul
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Créer un nouveau classeur
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Données');
    
    // Générer le fichier Excel
    XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    alert('Erreur lors de l\'export Excel');
    return false;
  }
};

/**
 * Exporter des données en PDF
 * @param {Array} data - Données à exporter (tableau d'objets)
 * @param {string} title - Titre du document
 * @param {string} filename - Nom du fichier (sans extension)
 */
export const exportToPDF = (data, title = 'Rapport', filename = 'export') => {
  try {
    // Créer un nouveau document PDF
    const doc = new jsPDF();
    
    // Ajouter le titre
    doc.setFontSize(18);
    doc.text(title, 14, 20);
    
    // Ajouter la date
    doc.setFontSize(10);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);
    
    // Extraire les colonnes (clés du premier objet)
    if (data.length === 0) {
      doc.text('Aucune donnée à afficher', 14, 45);
      doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
      return true;
    }
    
    const columns = Object.keys(data[0]);
    const headers = [columns];
    
    // Extraire les valeurs
    const rows = data.map(item => columns.map(col => item[col]));
    
    // Générer le tableau
    doc.autoTable({
      head: headers,
      body: rows,
      startY: 40,
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
    });
    
    // Sauvegarder le PDF
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
    
    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    alert('Erreur lors de l\'export PDF');
    return false;
  }
};

/**
 * Exporter des données en CSV
 * @param {Array} data - Données à exporter
 * @param {string} filename - Nom du fichier
 */
export const exportToCSV = (data, filename = 'export') => {
  try {
    if (data.length === 0) {
      alert('Aucune donnée à exporter');
      return false;
    }
    
    // Extraire les en-têtes
    const headers = Object.keys(data[0]);
    
    // Créer le contenu CSV
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Échapper les virgules et guillemets
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    // Créer le blob et télécharger
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    alert('Erreur lors de l\'export CSV');
    return false;
  }
};

/**
 * Préparer les données d'employés pour l'export
 * @param {Array} employees - Liste des employés
 * @returns {Array} - Données formatées
 */
export const prepareEmployeesExport = (employees) => {
  return employees.map(emp => ({
    'ID': emp.id,
    'Prénom': emp.firstName,
    'Nom': emp.lastName,
    'Email': emp.user?.email || '-',
    'Téléphone': emp.phone || '-',
    'Poste': emp.position,
    'Département': emp.department,
    'Date d\'embauche': new Date(emp.hireDate).toLocaleDateString('fr-FR'),
    'Statut': emp.isActive ? 'Actif' : 'Inactif',
    'Rôle': emp.user?.role || '-',
  }));
};

/**
 * Préparer les données de présences pour l'export
 * @param {Array} attendances - Liste des présences
 * @returns {Array} - Données formatées
 */
export const prepareAttendancesExport = (attendances) => {
  return attendances.map(att => ({
    'Employé': `${att.employee.firstName} ${att.employee.lastName}`,
    'Département': att.employee.department,
    'Date': new Date(att.date).toLocaleDateString('fr-FR'),
    'Arrivée': att.checkIn ? new Date(att.checkIn).toLocaleTimeString('fr-FR') : '-',
    'Départ': att.checkOut ? new Date(att.checkOut).toLocaleTimeString('fr-FR') : '-',
    'Heures travaillées': att.workHours || 0,
    'Statut': att.status,
  }));
};

/**
 * Préparer les données de congés pour l'export
 * @param {Array} leaves - Liste des demandes
 * @returns {Array} - Données formatées
 */
export const prepareLeavesExport = (leaves) => {
  return leaves.map(leave => ({
    'Employé': leave.employee ? `${leave.employee.firstName} ${leave.employee.lastName}` : '-',
    'Type': leave.leaveType,
    'Date début': new Date(leave.startDate).toLocaleDateString('fr-FR'),
    'Date fin': new Date(leave.endDate).toLocaleDateString('fr-FR'),
    'Raison': leave.reason,
    'Statut': leave.status,
    'Créé le': new Date(leave.createdAt).toLocaleDateString('fr-FR'),
  }));
};

/**
 * Générer un rapport PDF de présences avec statistiques
 * @param {Object} stats - Statistiques
 * @param {Array} data - Données détaillées
 * @param {string} period - Période du rapport
 */
export const generateAttendanceReport = (stats, data, period) => {
  const doc = new jsPDF();
  
  // En-tête
  doc.setFontSize(20);
  doc.text('Rapport de Présences', 14, 20);
  
  doc.setFontSize(12);
  doc.text(`Période: ${period}`, 14, 30);
  doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 14, 38);
  
  // Statistiques
  doc.setFontSize(14);
  doc.text('Statistiques', 14, 50);
  
  doc.setFontSize(11);
  let y = 60;
  doc.text(`Total jours: ${stats.totalDays}`, 14, y);
  doc.text(`Présents: ${stats.presentDays}`, 14, y + 8);
  doc.text(`En retard: ${stats.lateDays}`, 14, y + 16);
  doc.text(`Absents: ${stats.absentDays}`, 14, y + 24);
  doc.text(`Heures totales: ${stats.totalHours}h`, 14, y + 32);
  
  // Tableau détaillé
  if (data && data.length > 0) {
    const columns = Object.keys(data[0]);
    const headers = [columns];
    const rows = data.map(item => columns.map(col => item[col]));
    
    doc.autoTable({
      head: headers,
      body: rows,
      startY: y + 45,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });
  }
  
  doc.save(`rapport_presences_${new Date().toISOString().split('T')[0]}.pdf`);
};