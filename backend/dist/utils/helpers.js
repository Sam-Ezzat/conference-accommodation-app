"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = asyncHandler;
exports.createApiResponse = createApiResponse;
exports.createErrorResponse = createErrorResponse;
exports.createPaginatedResponse = createPaginatedResponse;
exports.parsePaginationParams = parsePaginationParams;
exports.validateRequiredFields = validateRequiredFields;
exports.convertRoleToFrontendFormat = convertRoleToFrontendFormat;
exports.sanitizeUser = sanitizeUser;
exports.generateId = generateId;
exports.parseDate = parseDate;
exports.isValidEmail = isValidEmail;
exports.isValidPhoneNumber = isValidPhoneNumber;
exports.formatPhoneNumber = formatPhoneNumber;
exports.calculateAge = calculateAge;
exports.formatName = formatName;
exports.sleep = sleep;
exports.debounce = debounce;
exports.deepClone = deepClone;
exports.removeEmptyFields = removeEmptyFields;
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
function createApiResponse(data, message = 'Success', status = 'success') {
    return {
        status,
        data,
        message,
        timestamp: new Date().toISOString()
    };
}
function createErrorResponse(message, status = 'error') {
    return {
        status,
        data: null,
        message,
        timestamp: new Date().toISOString()
    };
}
function createPaginatedResponse(items, total, page, pageSize) {
    return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
    };
}
function parsePaginationParams(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize) || 10));
    const skip = (page - 1) * pageSize;
    return { page, pageSize, skip };
}
function validateRequiredFields(data, requiredFields) {
    const missingFields = [];
    for (const field of requiredFields) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
            missingFields.push(field);
        }
    }
    return missingFields;
}
function convertRoleToFrontendFormat(role) {
    const roleMap = {
        'SUPER_ADMIN': 'super_admin',
        'ORG_ADMIN': 'org_admin',
        'ORGANIZER': 'organizer',
        'ASSISTANT': 'assistant',
        'COORDINATOR': 'coordinator',
        'VIEWER': 'viewer',
        'GUEST': 'guest'
    };
    return roleMap[role] || role.toLowerCase();
}
function sanitizeUser(user) {
    const { passwordHash, ...sanitizedUser } = user;
    if (sanitizedUser.role) {
        sanitizedUser.role = convertRoleToFrontendFormat(sanitizedUser.role);
    }
    return sanitizedUser;
}
function generateId() {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
function parseDate(dateString) {
    try {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    }
    catch {
        return null;
    }
}
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
function isValidPhoneNumber(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}
function formatPhoneNumber(phone) {
    return phone.replace(/[\s\-\(\)]/g, '');
}
function calculateAge(birthDate) {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}
function formatName(name) {
    return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function debounce(func, wait) {
    let timeout = null;
    return (...args) => {
        if (timeout)
            clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object')
        return obj;
    if (obj instanceof Date)
        return new Date(obj.getTime());
    if (obj instanceof Array)
        return obj.map(item => deepClone(item));
    const cloned = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            cloned[key] = deepClone(obj[key]);
        }
    }
    return cloned;
}
function removeEmptyFields(obj) {
    const cleaned = {};
    for (const key in obj) {
        if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
            cleaned[key] = obj[key];
        }
    }
    return cleaned;
}
//# sourceMappingURL=helpers.js.map