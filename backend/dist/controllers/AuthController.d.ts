import { Request, Response } from 'express';
import { AuthenticatedRequest } from '@/types';
export declare class AuthController {
    login(req: Request, res: Response): Promise<void>;
    register(req: Request, res: Response): Promise<void>;
    logout(req: AuthenticatedRequest, res: Response): Promise<void>;
    refreshToken(req: Request, res: Response): Promise<void>;
    getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    changePassword(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=AuthController.d.ts.map