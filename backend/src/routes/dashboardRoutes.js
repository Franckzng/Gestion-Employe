// backend/src/routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAdminDashboard,
  getEmployeeDashboard
} = require('../controllers/dashboardController');

// @route   GET /api/dashboard/admin
router.get('/admin', protect, authorize('ADMIN', 'HR'), getAdminDashboard);

// @route   GET /api/dashboard/employee
router.get('/employee', protect, getEmployeeDashboard);

module.exports = router;