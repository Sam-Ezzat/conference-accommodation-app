import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
export declare class RoomController {
    static getRoomsByAccommodation(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getRoomsByBuilding(req: AuthenticatedRequest, res: Response): Promise<void>;
    static createRoom(req: AuthenticatedRequest, res: Response): Promise<void>;
    static updateRoom(req: AuthenticatedRequest, res: Response): Promise<void>;
    static deleteRoom(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getRoomStatistics(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=RoomController.d.ts.map