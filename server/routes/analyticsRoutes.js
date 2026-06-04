const express = require('express');
const AnalyticsController = require('../controllers/analyticsController');
const AuthMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(AuthMiddleware.protect);

router.get('/dashboard', AnalyticsController.getDashboardAnalytics);
router.get('/reel/:id', AnalyticsController.getReelAnalytics);

module.exports = router;
