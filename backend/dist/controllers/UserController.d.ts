import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
export declare class UserController {
    getAllUsers(req: AuthenticatedRequest, res: Response): Promise<void>;
    createUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    getUserById(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateUser(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteUser(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=UserController.d.ts.map