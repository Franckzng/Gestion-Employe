// backend/src/controllers/employeeController.js

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// @desc    Obtenir tous les employés
// @route   GET /api/employees
// @access  Private (Admin/HR)
const getAllEmployees = async (req, res) => {
  try {
    const { search, department, isActive, page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Construire les filtres
    const where = {};
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (department) {
      where.department = department;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Récupérer les employés
    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true
            }
          }
        },
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.employee.count({ where })
    ]);

    res.json({
      employees,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des employés' });
  }
};

// @desc    Obtenir un employé par ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true
          }
        },
        attendances: {
          take: 10,
          orderBy: { date: 'desc' }
        },
        leaveRequests: {
          take: 5,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }

    res.json(employee);
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'employé' });
  }
};

// @desc    Créer un nouvel employé
// @route   POST /api/employees
// @access  Private (Admin/HR)
const createEmployee = async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      phone,
      address,
      position,
      department,
      salary,
      hireDate,
      birthDate
    } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName || !position || !department) {
      return res.status(400).json({ 
        error: 'Email, mot de passe, nom, prénom, poste et département sont requis' 
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur et l'employé
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'EMPLOYEE',
        employee: {
          create: {
            firstName,
            lastName,
            phone,
            address,
            position,
            department,
            salary: salary ? parseFloat(salary) : null,
            hireDate: hireDate ? new Date(hireDate) : new Date(),
            birthDate: birthDate ? new Date(birthDate) : null
          }
        }
      },
      include: {
        employee: true
      }
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'employé' });
  }
};

// @desc    Mettre à jour un employé
// @route   PUT /api/employees/:id
// @access  Private (Admin/HR)
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      email,
      firstName,
      lastName,
      phone,
      address,
      position,
      department,
      salary,
      birthDate,
      isActive,
      role
    } = req.body;

    // Vérifier si l'employé existe
    const existingEmployee = await prisma.employee.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingEmployee) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }

    // Si l'email est modifié, vérifier qu'il n'existe pas déjà
    if (email && email !== existingEmployee.user.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé par un autre utilisateur' });
      }
    }

    // Préparer les données de l'employé à mettre à jour
    const employeeUpdateData = {};
    
    if (firstName !== undefined) employeeUpdateData.firstName = firstName;
    if (lastName !== undefined) employeeUpdateData.lastName = lastName;
    if (phone !== undefined) employeeUpdateData.phone = phone;
    if (address !== undefined) employeeUpdateData.address = address;
    if (position !== undefined) employeeUpdateData.position = position;
    if (department !== undefined) employeeUpdateData.department = department;
    if (salary !== undefined) employeeUpdateData.salary = parseFloat(salary);
    if (birthDate !== undefined) employeeUpdateData.birthDate = new Date(birthDate);
    if (isActive !== undefined) employeeUpdateData.isActive = isActive;

    // Préparer les données de l'utilisateur à mettre à jour
    const userUpdateData = {};
    if (email !== undefined) userUpdateData.email = email;
    if (role !== undefined) userUpdateData.role = role;

    // Mettre à jour l'employé
    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        ...employeeUpdateData,
        ...(Object.keys(userUpdateData).length > 0 && {
          user: {
            update: userUpdateData
          }
        })
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.json(updatedEmployee);
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'employé' });
  }
};

// @desc    Supprimer un employé
// @route   DELETE /api/employees/:id
// @access  Private (Admin/HR)
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si l'employé existe
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!employee) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }

    // Supprimer l'utilisateur (cascade sur l'employé)
    await prisma.user.delete({
      where: { id: employee.userId }
    });

    res.json({ message: 'Employé supprimé avec succès' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'employé' });
  }
};

// @desc    Obtenir les statistiques d'un employé
// @route   GET /api/employees/:id/stats
// @access  Private
const getEmployeeStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { year, month } = req.query;

    // Construire la plage de dates
    const startDate = year && month 
      ? new Date(year, month - 1, 1)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      
    const endDate = year && month
      ? new Date(year, month, 0, 23, 59, 59)
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    // Récupérer les présences
    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId: id,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Calculer les statistiques
    const totalDays = attendances.length;
    const presentDays = attendances.filter(a => a.status === 'PRESENT').length;
    const lateDays = attendances.filter(a => a.status === 'LATE').length;
    const absentDays = attendances.filter(a => a.status === 'ABSENT').length;
    const totalWorkHours = attendances.reduce((sum, a) => sum + (a.workHours || 0), 0);

    // Récupérer les demandes de congé
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: {
        employeeId: id,
        OR: [
          {
            startDate: {
              gte: startDate,
              lte: endDate
            }
          },
          {
            endDate: {
              gte: startDate,
              lte: endDate
            }
          }
        ]
      }
    });

    const pendingLeaves = leaveRequests.filter(l => l.status === 'PENDING').length;
    const approvedLeaves = leaveRequests.filter(l => l.status === 'APPROVED').length;

    res.json({
      period: {
        startDate,
        endDate
      },
      attendance: {
        totalDays,
        presentDays,
        lateDays,
        absentDays,
        totalWorkHours: Math.round(totalWorkHours * 10) / 10
      },
      leaves: {
        pending: pendingLeaves,
        approved: approvedLeaves,
        total: leaveRequests.length
      }
    });
  } catch (error) {
    console.error('Get employee stats error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats
};