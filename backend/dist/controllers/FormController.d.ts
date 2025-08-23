import { Response } from 'express';
import { AuthenticatedRequest } from '@/types';
export declare class FormController {
    static getValidationRules(req: AuthenticatedRequest, res: Response): Promise<void>;
    static validateFormData(req: AuthenticatedRequest, res: Response): Promise<void>;
    static getFormTemplate(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=FormController.d.ts.map