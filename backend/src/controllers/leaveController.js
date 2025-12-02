// backend/src/controllers/leaveController.js

const { PrismaClient } = require('@prisma/client');
const { differenceInDays } = require('date-fns');

const prisma = new PrismaClient();

// @desc    Créer une demande de congé
// @route   POST /api/leaves
// @access  Private (Employee)
const createLeaveRequest = async (req, res) => {
  try {
    const employeeId = req.user.employee.id;
    const { leaveType, startDate, endDate, reason } = req.body;

    // Validation
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ 
        error: 'Type, dates de début/fin et raison sont requis' 
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({ 
        error: 'La date de début doit être antérieure à la date de fin' 
      });
    }

    // Vérifier les chevauchements
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        employeeId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          {
            AND: [
              { startDate: { lte: start } },
              { endDate: { gte: start } }
            ]
          },
          {
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: end } }
            ]
          },
          {
            AND: [
              { startDate: { gte: start } },
              { endDate: { lte: end } }
            ]
          }
        ]
      }
    });

    if (overlapping) {
      return res.status(400).json({ 
        error: 'Vous avez déjà une demande de congé pour cette période' 
      });
    }

    // Créer la demande
    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        employeeId,
        leaveType,
        startDate: start,
        endDate: end,
        reason
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            department: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Demande de congé créée avec succès',
      leaveRequest
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la demande' });
  }
};

// @desc    Obtenir toutes les demandes de congé
// @route   GET /api/leaves
// @access  Private (Admin/HR)
const getAllLeaveRequests = async (req, res) => {
  try {
    const { status, employeeId, page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (employeeId) where.employeeId = employeeId;

    const [leaveRequests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              department: true,
              position: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.leaveRequest.count({ where })
    ]);

    res.json({
      leaveRequests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des demandes' });
  }
};

// @desc    Obtenir les demandes de congé d'un employé
// @route   GET /api/leaves/my-requests
// @access  Private (Employee)
const getMyLeaveRequests = async (req, res) => {
  try {
    const employeeId = req.user.employee.id;
    const { status, page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { employeeId };
    if (status) where.status = status;

    const [leaveRequests, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.leaveRequest.count({ where })
    ]);

    res.json({
      leaveRequests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get my leave requests error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de vos demandes' });
  }
};

// @desc    Obtenir une demande de congé par ID
// @route   GET /api/leaves/:id
// @access  Private
const getLeaveRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            department: true,
            position: true
          }
        }
      }
    });

    if (!leaveRequest) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    res.json(leaveRequest);
  } catch (error) {
    console.error('Get leave request error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la demande' });
  }
};

// @desc    Approuver/Rejeter une demande de congé
// @route   PUT /api/leaves/:id/review
// @access  Private (Admin/HR)
const reviewLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ 
        error: 'Statut invalide. Utilisez APPROVED ou REJECTED' 
      });
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id }
    });

    if (!leaveRequest) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    if (leaveRequest.status !== 'PENDING') {
      return res.status(400).json({ 
        error: 'Cette demande a déjà été traitée' 
      });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        reviewNotes
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            department: true
          }
        }
      }
    });

    res.json({
      message: `Demande ${status === 'APPROVED' ? 'approuvée' : 'rejetée'} avec succès`,
      leaveRequest: updated
    });
  } catch (error) {
    console.error('Review leave request error:', error);
    res.status(500).json({ error: 'Erreur lors du traitement de la demande' });
  }
};

// @desc    Annuler une demande de congé
// @route   DELETE /api/leaves/:id
// @access  Private (Employee - own requests only)
const cancelLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user.employee.id;

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id }
    });

    if (!leaveRequest) {
      return res.status(404).json({ error: 'Demande non trouvée' });
    }

    // Vérifier que c'est bien la demande de l'employé
    if (leaveRequest.employeeId !== employeeId && !['ADMIN', 'HR'].includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Vous ne pouvez annuler que vos propres demandes' 
      });
    }

    // Ne peut pas annuler une demande déjà approuvée (sauf admin)
    if (leaveRequest.status === 'APPROVED' && !['ADMIN', 'HR'].includes(req.user.role)) {
      return res.status(400).json({ 
        error: 'Impossible d\'annuler une demande déjà approuvée. Contactez l\'administration.' 
      });
    }

    await prisma.leaveRequest.delete({
      where: { id }
    });

    res.json({ message: 'Demande de congé annulée avec succès' });
  } catch (error) {
    console.error('Cancel leave request error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'annulation de la demande' });
  }
};

// @desc    Obtenir les statistiques de congés d'un employé
// @route   GET /api/leaves/stats/:employeeId
// @access  Private
const getLeaveStats = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { year } = req.query;

    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31, 23, 59, 59);

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        employeeId,
        status: 'APPROVED',
        startDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Calculer les jours de congé par type
    const stats = {
      year: currentYear,
      totalDays: 0,
      byType: {}
    };

    leaveRequests.forEach(leave => {
      const days = differenceInDays(new Date(leave.endDate), new Date(leave.startDate)) + 1;
      stats.totalDays += days;
      
      if (!stats.byType[leave.leaveType]) {
        stats.byType[leave.leaveType] = 0;
      }
      stats.byType[leave.leaveType] += days;
    });

    res.json(stats);
  } catch (error) {
    console.error('Get leave stats error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};

module.exports = {
  createLeaveRequest,
  getAllLeaveRequests,
  getMyLeaveRequests,
  getLeaveRequestById,
  reviewLeaveRequest,
  cancelLeaveRequest,
  getLeaveStats
};