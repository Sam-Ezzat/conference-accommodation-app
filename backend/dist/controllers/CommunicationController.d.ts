import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
export declare class CommunicationController {
    getAllCommunications(req: AuthenticatedRequest, res: Response): Promise<void>;
    sendCommunication(req: AuthenticatedRequest, res: Response): Promise<void>;
    getCommunicationById(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=CommunicationController.d.ts.map