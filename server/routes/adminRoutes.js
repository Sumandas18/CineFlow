const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const AdminAuthMiddleware = require('../middleware/adminAuthMiddleware');

// Public Administrative Endpoints
router.post('/register', AdminController.register);
router.post('/verify-otp', AdminController.verifyOtp);
router.post('/resend-otp', AdminController.resendOtp);
router.post('/login', AdminController.login);

// Protected Administrative Endpoints
router.get('/profile', AdminAuthMiddleware.protect, AdminController.getProfile);
router.put('/profile/update', AdminAuthMiddleware.protect, AdminController.updateProfile);
router.delete('/profile/delete', AdminAuthMiddleware.protect, AdminController.deleteSelf);

// Dashboard Metrics & Controls
router.get('/stats', AdminAuthMiddleware.protect, AdminController.getStats);
router.put('/users/:userId/status', AdminAuthMiddleware.protect, AdminController.toggleUserStatus);
router.post('/users/:userId/remind', AdminAuthMiddleware.protect, AdminController.sendRenewalReminder);

module.exports = router;
