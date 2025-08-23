import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
export declare class BusController {
    static getBuses(req: AuthenticatedRequest, res: Response): Promise<void>;
    static createBus(req: AuthenticatedRequest, res: Response): Promise<void>;
    static updateBus(req: AuthenticatedRequest, res: Response): Promise<void>;
    static deleteBus(req: AuthenticatedRequest, res: Response): Promise<void>;
    static assignAttendeesToBus(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getBusStatistics(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=BusController.d.ts.map