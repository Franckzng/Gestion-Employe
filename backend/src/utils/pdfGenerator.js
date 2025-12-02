// backend/src/utils/pdfGenerator.js

const PDFDocument = require('pdfkit');
const { formatDate } = require('./formatters');

/**
 * Générer un rapport PDF de présences
 * @param {Array} attendances - Liste des présences
 * @param {Object} options - Options du rapport
 * @returns {Buffer} - PDF en buffer
 */
const generateAttendanceReport = async (attendances, options = {}) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // En-tête
      doc.fontSize(20).text('Rapport de Présences', { align: 'center' });
      doc.moveDown();

      // Informations du rapport
      doc.fontSize(12);
      if (options.startDate && options.endDate) {
        doc.text(`Période: ${formatDate(options.startDate)} - ${formatDate(options.endDate)}`);
      }
      doc.text(`Généré le: ${formatDate(new Date())}`);
      doc.moveDown();

      // Tableau des présences
      const tableTop = 200;
      const itemHeight = 30;
      
      // En-têtes de tableau
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Employé', 50, tableTop);
      doc.text('Date', 200, tableTop);
      doc.text('Arrivée', 300, tableTop);
      doc.text('Départ', 380, tableTop);
      doc.text('Heures', 460, tableTop);

      // Ligne de séparation
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Données
      doc.font('Helvetica');
      let currentY = tableTop + 25;

      attendances.forEach((attendance, index) => {
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }

        const employeeName = `${attendance.employee.firstName} ${attendance.employee.lastName}`;
        doc.text(employeeName, 50, currentY, { width: 140 });
        doc.text(formatDate(attendance.date), 200, currentY);
        doc.text(attendance.checkIn ? new Date(attendance.checkIn).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-', 300, currentY);
        doc.text(attendance.checkOut ? new Date(attendance.checkOut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-', 380, currentY);
        doc.text(attendance.workHours ? `${attendance.workHours}h` : '-', 460, currentY);

        currentY += itemHeight;
      });

      // Pied de page
      doc.fontSize(8).text(
        `Page 1 - ${attendances.length} entrées`,
        50,
        doc.page.height - 50,
        { align: 'center' }
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Générer un rapport PDF d'employés
 * @param {Array} employees - Liste des employés
 * @returns {Buffer} - PDF en buffer
 */
const generateEmployeeReport = async (employees) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // En-tête
      doc.fontSize(20).text('Liste des Employés', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Généré le: ${formatDate(new Date())}`);
      doc.text(`Total: ${employees.length} employés`);
      doc.moveDown();

      // Tableau
      const tableTop = 150;
      const itemHeight = 30;

      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Nom Complet', 50, tableTop);
      doc.text('Poste', 200, tableTop);
      doc.text('Département', 350, tableTop);
      doc.text('Statut', 480, tableTop);

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      doc.font('Helvetica');
      let currentY = tableTop + 25;

      employees.forEach((employee) => {
        if (currentY > 700) {
          doc.addPage();
          currentY = 50;
        }

        doc.text(`${employee.firstName} ${employee.lastName}`, 50, currentY, { width: 140 });
        doc.text(employee.position, 200, currentY, { width: 140 });
        doc.text(employee.department, 350, currentY, { width: 120 });
        doc.text(employee.isActive ? 'Actif' : 'Inactif', 480, currentY);

        currentY += itemHeight;
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Générer une fiche de paie (exemple)
 * @param {Object} employee - Employé
 * @param {Object} payslipData - Données de la fiche
 * @returns {Buffer} - PDF en buffer
 */
const generatePayslip = async (employee, payslipData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      // En-tête entreprise
      doc.fontSize(20).text('AERIS CONSULTING', { align: 'center' });
      doc.fontSize(12).text('Fiche de Paie', { align: 'center' });
      doc.moveDown();

      // Informations employé
      doc.fontSize(14).font('Helvetica-Bold').text('Informations Employé');
      doc.font('Helvetica').fontSize(10);
      doc.text(`Nom: ${employee.firstName} ${employee.lastName}`);
      doc.text(`Poste: ${employee.position}`);
      doc.text(`Département: ${employee.department}`);
      doc.moveDown();

      // Période
      doc.fontSize(14).font('Helvetica-Bold').text('Période');
      doc.font('Helvetica').fontSize(10);
      doc.text(`Mois: ${payslipData.month}`);
      doc.text(`Année: ${payslipData.year}`);
      doc.moveDown();

      // Détails de paie
      doc.fontSize(14).font('Helvetica-Bold').text('Détails de la Rémunération');
      doc.font('Helvetica').fontSize(10);
      doc.text(`Salaire de base: ${payslipData.baseSalary} FCFA`);
      doc.text(`Primes: ${payslipData.bonuses || 0} FCFA`);
      doc.text(`Déductions: ${payslipData.deductions || 0} FCFA`);
      doc.moveDown();
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(`Net à payer: ${payslipData.netSalary} FCFA`);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateAttendanceReport,
  generateEmployeeReport,
  generatePayslip,
};