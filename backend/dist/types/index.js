"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
class CustomError extends Error {
    status;
    code;
    details;
    constructor(message, status = 500, code, details) {
        super(message);
        this.status = status;
        this.code = code;
        this.details = details;
        this.name = 'CustomError';
    }
}
exports.CustomError = CustomError;
//# sourceMappingURL=index.js.map