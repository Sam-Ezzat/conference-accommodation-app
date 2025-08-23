"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const client_1 = require("@prisma/client");
const logger_1 = require("@/utils/logger");
const errorHandler_1 = require("@/middleware/errorHandler");
const auth_1 = require("@/middleware/auth");
const auth_2 = __importDefault(require("@/routes/auth"));
const events_1 = __importDefault(require("@/routes/events"));
const attendees_1 = __importDefault(require("@/routes/attendees"));
const accommodations_1 = __importDefault(require("@/routes/accommodations"));
const buildings_1 = __importDefault(require("@/routes/buildings"));
const rooms_1 = __importDefault(require("@/routes/rooms"));
const buses_1 = __importDefault(require("@/routes/buses"));
const assignments_1 = __importDefault(require("@/routes/assignments"));
const forms_1 = __importDefault(require("@/routes/forms"));
const reports_1 = __importDefault(require("@/routes/reports"));
const audit_1 = __importDefault(require("@/routes/audit"));
const users_1 = __importDefault(require("@/routes/users"));
const communications_1 = __importDefault(require("@/routes/communications"));
const dashboard_1 = __importDefault(require("@/routes/dashboard"));
exports.prisma = new client_1.PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((req, res, next) => {
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://192.168.100.4:3000'
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin) || !origin) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    next();
});
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use((0, compression_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Conference Accommodation API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Conference Accommodation API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
app.use('/api/auth', auth_2.default);
app.use('/api/events', auth_1.authMiddleware, events_1.default);
app.use('/api/attendees', auth_1.authMiddleware, attendees_1.default);
app.use('/api/accommodations', auth_1.authMiddleware, accommodations_1.default);
app.use('/api/buildings', auth_1.authMiddleware, buildings_1.default);
app.use('/api/rooms', auth_1.authMiddleware, rooms_1.default);
app.use('/api/buses', auth_1.authMiddleware, buses_1.default);
app.use('/api/assignments', auth_1.authMiddleware, assignments_1.default);
app.use('/api/forms', auth_1.authMiddleware, forms_1.default);
app.use('/api/reports', auth_1.authMiddleware, reports_1.default);
app.use('/api/audit', auth_1.authMiddleware, audit_1.default);
app.use('/api/users', auth_1.authMiddleware, users_1.default);
app.use('/api/communications', auth_1.authMiddleware, communications_1.default);
app.use('/api/dashboard', auth_1.authMiddleware, dashboard_1.default);
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'error',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
    });
});
app.use(errorHandler_1.errorHandler);
process.on('SIGTERM', async () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    await exports.prisma.$disconnect();
    process.exit(0);
});
process.on('SIGINT', async () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    await exports.prisma.$disconnect();
    process.exit(0);
});
async function startServer() {
    try {
        await exports.prisma.$connect();
        logger_1.logger.info('Connected to database successfully');
        app.listen(PORT, () => {
            logger_1.logger.info(`🚀 Server is running on port ${PORT}`);
            logger_1.logger.info(`📊 Health check: http://localhost:${PORT}/health`);
            logger_1.logger.info(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map