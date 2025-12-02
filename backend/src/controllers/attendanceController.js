// backend/src/controllers/attendanceController.js

const { PrismaClient } = require('@prisma/client');
const { startOfDay, endOfDay, differenceInHours } = require('date-fns');

const prisma = new PrismaClient();

// @desc    Pointer l'arrivée (check-in)
// @route   POST /api/attendance/check-in
// @access  Private (Employee)
const checkIn = async (req, res) => {
  try {
    const employeeId = req.user.employee.id;
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // Vérifier si l'employé a déjà pointé aujourd'hui
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    if (existingAttendance) {
      return res.status(400).json({ 
        error: 'Vous avez déjà pointé votre arrivée aujourd\'hui',
        attendance: existingAttendance
      });
    }

    // Créer le pointage
    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        date: todayStart,
        checkIn: now,
        status: 'PRESENT'
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Arrivée enregistrée avec succès',
      attendance
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'arrivée' });
  }
};

// @desc    Pointer le départ (check-out)
// @route   POST /api/attendance/check-out
// @access  Private (Employee)
const checkOut = async (req, res) => {
  try {
    const employeeId = req.user.employee.id;
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    // Récupérer le pointage d'aujourd'hui
    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    if (!attendance) {
      return res.status(400).json({ 
        error: 'Vous devez d\'abord pointer votre arrivée' 
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ 
        error: 'Vous avez déjà pointé votre départ aujourd\'hui',
        attendance
      });
    }

    // Calculer les heures travaillées
    const workHours = differenceInHours(now, new Date(attendance.checkIn));

    // Mettre à jour le pointage
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: now,
        workHours: Math.max(0, workHours)
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      message: 'Départ enregistré avec succès',
      attendance: updatedAttendance
    });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement du départ' });
  }
};

// @desc    Obtenir le statut de pointage d'aujourd'hui
// @route   GET /api/attendance/today
// @access  Private (Employee)
const getTodayAttendance = async (req, res) => {
  try {
    const employeeId = req.user.employee.id;
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());

    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    res.json(attendance || null);
  } catch (error) {
    console.error('Get today attendance error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du pointage' });
  }
};

// @desc    Obtenir toutes les présences (avec filtres)
// @route   GET /api/attendance
// @access  Private (Admin/HR)
const getAllAttendances = async (req, res) => {
  try {
    const { 
      employeeId, 
      startDate, 
      endDate, 
      status,
      page = 1, 
      limit = 20 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Construire les filtres
    const where = {};

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (status) {
      where.status = status;
    }

    // Récupérer les présences
    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
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
        orderBy: { date: 'desc' }
      }),
      prisma.attendance.count({ where })
    ]);

    res.json({
      attendances,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get attendances error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des présences' });
  }
};

// @desc    Obtenir l'historique des présences d'un employé
// @route   GET /api/attendance/employee/:employeeId
// @access  Private
const getEmployeeAttendances = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate, page = 1, limit = 30 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { employeeId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const [attendances, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { date: 'desc' }
      }),
      prisma.attendance.count({ where })
    ]);

    res.json({
      attendances,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get employee attendances error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des présences' });
  }
};

// @desc    Créer/Modifier une présence manuellement (Admin)
// @route   POST /api/attendance/manual
// @access  Private (Admin/HR)
const createManualAttendance = async (req, res) => {
  try {
    const { employeeId, date, checkIn, checkOut, status, notes } = req.body;

    if (!employeeId || !date) {
      return res.status(400).json({ 
        error: 'L\'ID de l\'employé et la date sont requis' 
      });
    }

    const attendanceDate = startOfDay(new Date(date));

    // Vérifier si une présence existe déjà
    const existing = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: attendanceDate
      }
    });

    let workHours = null;
    if (checkIn && checkOut) {
      workHours = differenceInHours(new Date(checkOut), new Date(checkIn));
    }

    if (existing) {
      // Mettre à jour
      const updated = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          checkIn: checkIn ? new Date(checkIn) : existing.checkIn,
          checkOut: checkOut ? new Date(checkOut) : existing.checkOut,
          status: status || existing.status,
          workHours: workHours !== null ? workHours : existing.workHours,
          notes
        },
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });
      return res.json(updated);
    }

    // Créer
    const attendance = await prisma.attendance.create({
      data: {
        employeeId,
        date: attendanceDate,
        checkIn: checkIn ? new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        status: status || 'PRESENT',
        workHours,
        notes
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.status(201).json(attendance);
  } catch (error) {
    console.error('Create manual attendance error:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la présence' });
  }
};

// @desc    Supprimer une présence
// @route   DELETE /api/attendance/:id
// @access  Private (Admin/HR)
const deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.attendance.delete({
      where: { id }
    });

    res.json({ message: 'Présence supprimée avec succès' });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la présence' });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayAttendance,
  getAllAttendances,
  getEmployeeAttendances,
  createManualAttendance,
  deleteAttendance
};