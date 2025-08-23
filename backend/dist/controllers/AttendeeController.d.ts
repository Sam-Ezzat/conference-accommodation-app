import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
export declare class AttendeeController {
    getAttendees(req: AuthenticatedRequest, res: Response): Promise<void>;
    getAllAttendees(req: AuthenticatedRequest, res: Response): Promise<void>;
    getAttendee(req: AuthenticatedRequest, res: Response): Promise<void>;
    createAttendee(req: AuthenticatedRequest, res: Response): Promise<void>;
    updateAttendee(req: AuthenticatedRequest, res: Response): Promise<void>;
    deleteAttendee(req: AuthenticatedRequest, res: Response): Promise<void>;
    importAttendees(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getEventAttendees(req: AuthenticatedRequest, res: Response): Promise<void>;
    static createEventAttendee(req: AuthenticatedRequest, res: Response): Promise<void>;
    static importEventAttendees(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=AttendeeController.d.ts.map