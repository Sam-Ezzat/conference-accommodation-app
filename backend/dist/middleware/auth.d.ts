import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/types';
export declare function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
export declare function requireRole(allowedRoles: string[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare function requirePermission(permission: string): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare function requireOwnership(resourceIdParam?: string): (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
export declare function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map