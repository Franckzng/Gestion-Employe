// backend/src/routes/attendanceRoutes.js

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  checkIn,
  checkOut,
  getTodayAttendance,
  getAllAttendances,
  getEmployeeAttendances,
  createManualAttendance,
  deleteAttendance
} = require('../controllers/attendanceController');

// Routes pour les employés
// @route   POST /api/attendance/check-in
router.post('/check-in', protect, checkIn);

// @route   POST /api/attendance/check-out
router.post('/check-out', protect, checkOut);

// @route   GET /api/attendance/today
router.get('/today', protect, getTodayAttendance);

// Routes pour les admins
// @route   GET /api/attendance
router.get('/', protect, authorize('ADMIN', 'HR'), getAllAttendances);

// @route   POST /api/attendance/manual
router.post('/manual', protect, authorize('ADMIN', 'HR'), createManualAttendance);

// @route   GET /api/attendance/employee/:employeeId
router.get('/employee/:employeeId', protect, getEmployeeAttendances);

// @route   DELETE /api/attendance/:id
router.delete('/:id', protect, authorize('ADMIN', 'HR'), deleteAttendance);

module.exports = router;