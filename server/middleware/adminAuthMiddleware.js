const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

class AdminAuthMiddleware {
    static async protect(req, res, next) {
        try {
            let token;
            if (req.cookies && req.cookies.adminToken) {
                token = req.cookies.adminToken;
            } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                token = req.headers.authorization.split(' ')[1];
            }

            if (!token) {
                return res.status(401).json({ message: 'Not authorized as admin' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.admin = await Admin.findById(decoded.id);

            if (!req.admin) {
                return res.status(401).json({ message: 'Admin not found' });
            }

            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized as admin' });
        }
    }
}

module.exports = AdminAuthMiddleware;
