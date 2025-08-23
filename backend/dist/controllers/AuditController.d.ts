import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
export declare class AuditController {
    static getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getAuditStatistics(req: AuthenticatedRequest, res: Response): Promise<void>;
    static createAuditLog(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=AuditController.d.ts.map