require('dotenv').config();
require('./utils/envChecker')(); // Auto-validate env variables on startup

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');
const http = require('http');
const socket = require('./config/socket');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reelRoutes = require('./routes/reelRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const musicRoutes = require('./routes/musicRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const renderRoutes = require('./routes/renderRoutes');

const app = express();

// Connect to Database
connectDB();

// Security Middlewares
app.use(helmet());
app.use(cors({
    origin: function(origin, callback) {
        // Allow all origins in development to prevent fetch failures
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/render', renderRoutes);

// Root Route
app.get('/', (req, res) => {
    res.json({ message: 'CreatorOS AI API is running...' });
});

// Expiration Check Task (Runs automatically every 24 hours)
const User = require('./models/User');
const emailService = require('./services/emailService');

const scanSubscriptionExpirations = async () => {
    try {
        console.log('[Scheduler] Scanning expiring subscription plans...');
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
        const today = new Date();

        // Find users whose endDate is within 3 days, status is active, and who haven't expired yet
        const usersToExpire = await User.find({
            'subscription.status': 'active',
            'subscription.endDate': {
                $gte: today,
                $lte: threeDaysFromNow
            }
        });

        console.log(`[Scheduler] Found ${usersToExpire.length} users with expiring subscription plans.`);
        for (const user of usersToExpire) {
            const planName = user.subscription.plan || 'Premium Plan';
            const expDateStr = new Date(user.subscription.endDate).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });

            await emailService.sendRenewalReminderEmail(user.email, user.name, planName, expDateStr);
            console.log(`[Scheduler] Automatically dispatched expiration warning email to ${user.email}`);
        }
    } catch (err) {
        console.error('[Scheduler] Expiration scan error:', err);
    }
};

// Run automatically on server startup and schedule every 24 hours
setTimeout(scanSubscriptionExpirations, 5000); 
setInterval(scanSubscriptionExpirations, 24 * 60 * 60 * 1000); 

// Error Handler (Must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
const server = http.createServer(app);

// Initialize Socket.io
const io = socket.init(server);
io.on('connection', (client) => {
    console.log('[Socket.io] Client connected:', client.id);
    client.on('disconnect', () => {
        console.log('[Socket.io] Client disconnected:', client.id);
    });
});

// Initialize Background Queue Processor
require('./services/queueService');

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});