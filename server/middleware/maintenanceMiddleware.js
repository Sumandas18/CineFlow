const Setting = require('../models/Setting');

const maintenanceMiddleware = async (req, res, next) => {
    try {
        // Skip maintenance check for OPTIONS requests (CORS preflight), admin routes, auth routes, and plans
        if (req.method === 'OPTIONS' || req.path.startsWith('/api/admin') || req.path.startsWith('/api/auth') || req.path.startsWith('/api/plans')) {
            return next();
        }

        const settings = await Setting.findOne();
        if (settings && settings.maintenanceMode) {
            return res.status(503).json({
                success: false,
                message: 'System is currently under maintenance. Please try again later.'
            });
        }
        
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = maintenanceMiddleware;
