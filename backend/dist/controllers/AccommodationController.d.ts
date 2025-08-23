import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
export declare class AccommodationController {
    static getAccommodations(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getAllAccommodations(req: AuthenticatedRequest, res: Response): Promise<void>;
    static createAccommodation(req: AuthenticatedRequest, res: Response): Promise<void>;
    static updateAccommodation(req: AuthenticatedRequest, res: Response): Promise<void>;
    static deleteAccommodation(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getBuildings(req: AuthenticatedRequest, res: Response): Promise<void>;
    static createBuilding(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getEventAccommodations(req: AuthenticatedRequest, res: Response): Promise<void>;
    static createEventAccommodation(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=AccommodationController.d.ts.map