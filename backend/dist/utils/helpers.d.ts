import { Request, Response, NextFunction } from 'express';
import { ApiResponse, PaginatedResponse } from '@/types';
export declare function asyncHandler(fn: Function): (req: Request, res: Response, next: NextFunction) => void;
export declare function createApiResponse<T>(data: T, message?: string, status?: 'success' | 'error'): ApiResponse<T>;
export declare function createErrorResponse(message: string, status?: 'error'): ApiResponse<null>;
export declare function createPaginatedResponse<T>(items: T[], total: number, page: number, pageSize: number): PaginatedResponse<T>;
export declare function parsePaginationParams(query: any): {
    page: number;
    pageSize: number;
    skip: number;
};
export declare function validateRequiredFields(data: any, requiredFields: string[]): string[];
export declare function convertRoleToFrontendFormat(role: string): string;
export declare function sanitizeUser(user: any): any;
export declare function generateId(): string;
export declare function parseDate(dateString: string): Date | null;
export declare function isValidEmail(email: string): boolean;
export declare function isValidPhoneNumber(phone: string): boolean;
export declare function formatPhoneNumber(phone: string): string;
export declare function calculateAge(birthDate: Date): number;
export declare function formatName(name: string): string;
export declare function sleep(ms: number): Promise<void>;
export declare function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void;
export declare function deepClone<T>(obj: T): T;
export declare function removeEmptyFields(obj: any): any;
//# sourceMappingURL=helpers.d.ts.map