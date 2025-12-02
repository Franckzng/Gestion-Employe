// backend/src/controllers/dashboardController.js

const { PrismaClient } = require('@prisma/client');
const { startOfMonth, endOfMonth, startOfDay, endOfDay, subDays } = require('date-fns');

const prisma = new PrismaClient();

// @desc    Obtenir les statistiques du tableau de bord admin
// @route   GET /api/dashboard/admin
// @access  Private (Admin/HR)
const getAdminDashboard = async (req, res) => {
  try {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    // Statistiques des employés
    const [totalEmployees, activeEmployees, inactiveEmployees] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { isActive: true } }),
      prisma.employee.count({ where: { isActive: false } })
    ]);

    // Statistiques des présences du jour
    const todayAttendances = await prisma.attendance.findMany({
      where: {
        date: {
          gte: todayStart,
          lte: todayEnd
        }
      }
    });

    const presentToday = todayAttendances.filter(a => a.status === 'PRESENT').length;
    const lateToday = todayAttendances.filter(a => a.status === 'LATE').length;
    const absentToday = activeEmployees - todayAttendances.length;

    // Statistiques des demandes de congé
    const [pendingLeaves, approvedLeavesThisMonth] = await Promise.all([
      prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
      prisma.leaveRequest.count({
        where: {
          status: 'APPROVED',
          startDate: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      })
    ]);

    // Employés en congé aujourd'hui
    const onLeaveToday = await prisma.leaveRequest.count({
      where: {
        status: 'APPROVED',
        startDate: { lte: today },
        endDate: { gte: today }
      }
    });

    // Statistiques par département
    const employeesByDepartment = await prisma.employee.groupBy({
      by: ['department'],
      where: { isActive: true },
      _count: true
    });

    // Présences des 7 derniers jours
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const count = await prisma.attendance.count({
        where: {
          date: {
            gte: dayStart,
            lte: dayEnd
          },
          status: 'PRESENT'
        }
      });

      last7Days.push({
        date: dayStart,
        count
      });
    }

    // Demandes de congé récentes
    const recentLeaveRequests = await prisma.leaveRequest.findMany({
      where: { status: 'PENDING' },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            department: true
          }
        }
      },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: inactiveEmployees
      },
      attendance: {
        today: {
          present: presentToday,
          late: lateToday,
          absent: absentToday,
          onLeave: onLeaveToday
        },
        last7Days
      },
      leaves: {
        pending: pendingLeaves,
        approvedThisMonth: approvedLeavesThisMonth,
        recentRequests: recentLeaveRequests
      },
      departments: employeesByDepartment.map(d => ({
        name: d.department,
        count: d._count
      }))
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du tableau de bord' });
  }
};

// @desc    Obtenir les statistiques du tableau de bord employé
// @route   GET /api/dashboard/employee
// @access  Private (Employee)
const getEmployeeDashboard = async (req, res) => {
  try {
    const employeeId = req.user.employee.id;
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    // Présence du jour
    const todayAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId,
        date: {
          gte: startOfDay(today),
          lte: endOfDay(today)
        }
      }
    });

    // Statistiques du mois en cours
    const monthAttendances = await prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: monthStart,
          lte: monthEnd
        }
      }
    });

    const presentDays = monthAttendances.filter(a => a.status === 'PRESENT').length;
    const lateDays = monthAttendances.filter(a => a.status === 'LATE').length;
    const absentDays = monthAttendances.filter(a => a.status === 'ABSENT').length;
    const totalWorkHours = monthAttendances.reduce((sum, a) => sum + (a.workHours || 0), 0);

    // Demandes de congé
    const [pendingLeaves, approvedLeaves, rejectedLeaves] = await Promise.all([
      prisma.leaveRequest.count({ 
        where: { employeeId, status: 'PENDING' } 
      }),
      prisma.leaveRequest.count({ 
        where: { 
          employeeId, 
          status: 'APPROVED',
          startDate: {
            gte: monthStart,
            lte: monthEnd
          }
        } 
      }),
      prisma.leaveRequest.count({ 
        where: { 
          employeeId, 
          status: 'REJECTED',
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        } 
      })
    ]);

    // Demandes de congé récentes
    const recentLeaveRequests = await prisma.leaveRequest.findMany({
      where: { employeeId },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    // Présences des 7 derniers jours
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      const attendance = await prisma.attendance.findFirst({
        where: {
          employeeId,
          date: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      });

      last7Days.push({
        date: dayStart,
        status: attendance ? attendance.status : 'ABSENT',
        workHours: attendance ? attendance.workHours : 0
      });
    }

    res.json({
      today: {
        attendance: todayAttendance
      },
      thisMonth: {
        attendance: {
          presentDays,
          lateDays,
          absentDays,
          totalDays: monthAttendances.length,
          totalWorkHours: Math.round(totalWorkHours * 10) / 10
        },
        leaves: {
          pending: pendingLeaves,
          approved: approvedLeaves,
          rejected: rejectedLeaves
        }
      },
      recentLeaveRequests,
      last7Days
    });
  } catch (error) {
    console.error('Get employee dashboard error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du tableau de bord' });
  }
};

module.exports = {
  getAdminDashboard,
  getEmployeeDashboard
};