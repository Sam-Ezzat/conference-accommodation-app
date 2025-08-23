"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.asyncHandler = asyncHandler;
const logger_1 = require("@/utils/logger");
const helpers_1 = require("@/utils/helpers");
const types_1 = require("@/types");
function errorHandler(error, req, res, next) {
    logger_1.logger.error(`Error in ${req.method} ${req.path}:`, {
        error: error.message,
        stack: error.stack,
        body: req.body,
        params: req.params,
        query: req.query,
        headers: req.headers
    });
    if (error instanceof types_1.CustomError) {
        res.status(error.status).json((0, helpers_1.createErrorResponse)(error.message));
        return;
    }
    if (error.name === 'PrismaClientKnownRequestError') {
        const prismaError = error;
        switch (prismaError.code) {
            case 'P2002':
                res.status(409).json((0, helpers_1.createErrorResponse)('A record with this information already exists'));
                return;
            case 'P2025':
                res.status(404).json((0, helpers_1.createErrorResponse)('Record not found'));
                return;
            case 'P2003':
                res.status(400).json((0, helpers_1.createErrorResponse)('Foreign key constraint failed'));
                return;
            default:
                res.status(400).json((0, helpers_1.createErrorResponse)('Database operation failed'));
                return;
        }
    }
    if (error.name === 'ValidationError') {
        res.status(400).json((0, helpers_1.createErrorResponse)(error.message));
        return;
    }
    if (error.name === 'JsonWebTokenError') {
        res.status(401).json((0, helpers_1.createErrorResponse)('Invalid token'));
        return;
    }
    if (error.name === 'TokenExpiredError') {
        res.status(401).json((0, helpers_1.createErrorResponse)('Token expired'));
        return;
    }
    if (error.name === 'MulterError') {
        const multerError = error;
        switch (multerError.code) {
            case 'LIMIT_FILE_SIZE':
                res.status(400).json((0, helpers_1.createErrorResponse)('File too large'));
                return;
            case 'LIMIT_FILE_COUNT':
                res.status(400).json((0, helpers_1.createErrorResponse)('Too many files'));
                return;
            case 'LIMIT_UNEXPECTED_FILE':
                res.status(400).json((0, helpers_1.createErrorResponse)('Unexpected file field'));
                return;
            default:
                res.status(400).json((0, helpers_1.createErrorResponse)('File upload error'));
                return;
        }
    }
    const statusCode = process.env.NODE_ENV === 'production' ? 500 : 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message || 'Internal server error';
    res.status(statusCode).json((0, helpers_1.createErrorResponse)(message));
}
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
//# sourceMappingURL=errorHandler.js.map