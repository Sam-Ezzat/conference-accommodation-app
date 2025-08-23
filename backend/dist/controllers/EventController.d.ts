import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
export declare class EventController {
    getEvents(req: AuthenticatedRequest, res: Response): Promise<void>;
    getEvent(req: AuthenticatedRequest, res: Response): Promise<void>;
    createEvent(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateEvent(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteEvent(req: AuthenticatedRequest, res: Response): Promise<void>;
    getEventStatistics(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=EventController.d.ts.map