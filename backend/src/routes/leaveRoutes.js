// backend/src/routes/leaveRoutes.js

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  createLeaveRequest,
  getAllLeaveRequests,
  getMyLeaveRequests,
  getLeaveRequestById,
  reviewLeaveRequest,
  cancelLeaveRequest,
  getLeaveStats
} = require('../controllers/leaveController');

// Routes pour les employés
// @route   POST /api/leaves
router.post('/', protect, createLeaveRequest);

// @route   GET /api/leaves/my-requests
router.get('/my-requests', protect, getMyLeaveRequests);

// Routes pour tous (avec vérification de propriétaire dans le contrôleur)
// @route   GET /api/leaves/:id
router.get('/:id', protect, getLeaveRequestById);

// @route   DELETE /api/leaves/:id
router.delete('/:id', protect, cancelLeaveRequest);

// Routes pour les admins
// @route   GET /api/leaves
router.get('/', protect, authorize('ADMIN', 'HR'), getAllLeaveRequests);

// @route   PUT /api/leaves/:id/review
router.put('/:id/review', protect, authorize('ADMIN', 'HR'), reviewLeaveRequest);

// @route   GET /api/leaves/stats/:employeeId
router.get('/stats/:employeeId', protect, getLeaveStats);

module.exports = router;