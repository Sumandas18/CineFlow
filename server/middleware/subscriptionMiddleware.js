class SubscriptionMiddleware {
    static async checkUsage(req, res, next) {
        const user = req.user;

        // Check if user has active subscription
        if (user.subscription && user.subscription.status === 'active') {
            const now = new Date();
            if (user.subscription.endDate > now) {
                return next();
            }
        }

        // Check free trial count
        if (user.aiUsageCount < 2) {
            return next();
        }

        return res.status(403).json({
            message: 'AI generation limit reached. Please upgrade to a premium plan.',
            limitReached: true
        });
    }
}

module.exports = SubscriptionMiddleware;
