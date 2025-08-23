import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
export declare class AssignmentController {
    static getAssignments(req: AuthenticatedRequest, res: Response): Promise<void>;
    static assignAttendeeToRoom(req: AuthenticatedRequest, res: Response): Promise<void>;
    static bulkAssignAttendees(req: AuthenticatedRequest, res: Response): Promise<void>;
    static autoAssignRooms(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getAssignmentStatistics(req: AuthenticatedRequest, res: Response): Promise<void>;
    static validateAssignment(req: AuthenticatedRequest, res: Response): Promise<void>;
    static autoAssignEventRooms(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=AssignmentController.d.ts.map