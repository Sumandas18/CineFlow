const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');
const { protect: adminProtect } = require('../middleware/adminAuthMiddleware');

// Public route to fetch prices
router.get('/', planController.getPlans);

// Admin route to update prices
router.put('/', adminProtect, planController.updatePlan);

module.exports = router;
