import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
export declare class ReportController {
    static getEventSummaryReport(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getAccommodationReport(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getTransportationReport(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=ReportController.d.ts.map