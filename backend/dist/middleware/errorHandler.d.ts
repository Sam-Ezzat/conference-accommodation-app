import { Request, Response, NextFunction } from 'express';
import { CustomError } from '@/types';
export declare function errorHandler(error: Error | CustomError, req: Request, res: Response, next: NextFunction): void;
export declare function asyncHandler(fn: Function): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map