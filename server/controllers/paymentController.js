const paymentService = require('../services/paymentService');
const Payment = require('../models/Payment');
const User = require('../models/User');
const emailService = require('../services/emailService');

class PaymentController {
    static async createOrder(req, res, next) {
        try {
            const { plan } = req.body;
            let amount;
            let planName;

            switch (plan) {
                case '3 Months':
                case 'Starter':
                    amount = 199;
                    planName = 'Starter';
                    break;
                case '6 Months':
                case 'Creator Pro':
                    amount = 499;
                    planName = 'Creator Pro';
                    break;
                case '12 Months':
                case 'Unlimited Pro+':
                    amount = 899;
                    planName = 'Unlimited Pro+';
                    break;
                default:
                    return res.status(400).json({ message: 'Invalid plan selected' });
            }

            // Calculate GST
            const gstAmount = Math.round(amount * 0.18);
            const totalAmount = amount + gstAmount;

            const order = await paymentService.createOrder(totalAmount, planName);

            await Payment.create({
                userId: req.user.id,
                razorpayOrderId: order.id,
                plan: planName,
                amount: totalAmount * 100,
                status: 'created'
            });

            res.status(200).json({
                success: true,
                key: process.env.RAZORPAY_KEY_ID,
                id: order.id,
                amount: order.amount,
                currency: order.currency,
                order
            });
        } catch (error) {
            next(error);
        }
    }

    static async verifyPayment(req, res, next) {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

            const isAuthentic = paymentService.verifySignature(
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature
            );

            if (!isAuthentic) {
                return res.status(400).json({ message: 'Payment verification failed' });
            }

            // 1. Update Payment record
            const payment = await Payment.findOneAndUpdate(
                { razorpayOrderId: razorpay_order_id },
                {
                    razorpayPaymentId: razorpay_payment_id,
                    razorpaySignature: razorpay_signature,
                    status: 'paid'
                },
                { new: true }
            );

            // 2. Activate Subscription
            let durationMonths = 0;
            if (payment.plan === '3 Months' || payment.plan === 'Starter') durationMonths = 3;
            else if (payment.plan === '6 Months' || payment.plan === 'Creator Pro') durationMonths = 6;
            else if (payment.plan === '12 Months' || payment.plan === 'Unlimited Pro+') durationMonths = 12;

            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + durationMonths);

            let assignedCredits = 50; // Starter default
            if (payment.plan === '6 Months' || payment.plan === 'Creator Pro') assignedCredits = 300;
            else if (payment.plan === '12 Months' || payment.plan === 'Unlimited Pro+') assignedCredits = 9999;

            await User.findByIdAndUpdate(req.user.id, {
                subscription: {
                    plan: payment.plan,
                    startDate: new Date(),
                    endDate: endDate,
                    status: 'active'
                },
                credits: assignedCredits,
                aiUsageCount: 0
            });

            // 3. Send Success Email
            const user = await User.findById(req.user.id);
            if (user && user.email) {
                let emailPlanName = payment.plan;
                if (payment.plan === '3 Months') emailPlanName = 'Starter';
                else if (payment.plan === '6 Months') emailPlanName = 'Creator Pro';
                else if (payment.plan === '12 Months') emailPlanName = 'Unlimited Pro+';
                
                // Fire and forget (don't await so we don't slow down the response)
                emailService.sendSubscriptionSuccessEmail(user.email, user.name, emailPlanName).catch(console.error);
            }

            res.status(200).json({
                success: true,
                message: 'Payment verified and subscription activated'
            });
        } catch (error) {
            next(error);
        }
    }

    static async getHistory(req, res, next) {
        try {
            const payments = await Payment.find({ userId: req.user.id }).sort('-createdAt');
            res.status(200).json({ success: true, payments });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = PaymentController;
