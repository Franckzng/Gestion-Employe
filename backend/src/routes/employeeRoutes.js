// backend/src/routes/employeeRoutes.js

const express = require('express');
const router = express.Router();
const { protect, authorize, authorizeOwnerOrAdmin } = require('../middleware/auth');
const {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeStats
} = require('../controllers/employeeController');

// @route   GET /api/employees
router.get('/', protect, authorize('ADMIN', 'HR'), getAllEmployees);

// @route   POST /api/employees
router.post('/', protect, authorize('ADMIN', 'HR'), createEmployee);

// @route   GET /api/employees/:id
router.get('/:id', protect, authorizeOwnerOrAdmin, getEmployeeById);

// @route   PUT /api/employees/:id
router.put('/:id', protect, authorize('ADMIN', 'HR'), updateEmployee);

// @route   DELETE /api/employees/:id
router.delete('/:id', protect, authorize('ADMIN', 'HR'), deleteEmployee);

// @route   GET /api/employees/:id/stats
router.get('/:id/stats', protect, authorizeOwnerOrAdmin, getEmployeeStats);

module.exports = router;