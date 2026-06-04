const express = require('express');
const PaymentController = require('../controllers/paymentController');
const AuthMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(AuthMiddleware.protect);

router.post('/create-order', PaymentController.createOrder);
router.post('/verify', PaymentController.verifyPayment);
router.get('/history', PaymentController.getHistory);

module.exports = router;
