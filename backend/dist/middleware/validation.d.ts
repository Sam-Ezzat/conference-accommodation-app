import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare function validateBody(schema: Joi.ObjectSchema): (req: Request, res: Response, next: NextFunction) => void;
export declare function validateParams(schema: Joi.ObjectSchema): (req: Request, res: Response, next: NextFunction) => void;
export declare function validateQuery(schema: Joi.ObjectSchema): (req: Request, res: Response, next: NextFunction) => void;
export declare const schemas: {
    id: Joi.ObjectSchema<any>;
    pagination: Joi.ObjectSchema<any>;
    loginCredentials: Joi.ObjectSchema<any>;
    registerUser: Joi.ObjectSchema<any>;
    createEvent: Joi.ObjectSchema<any>;
    updateEvent: Joi.ObjectSchema<any>;
    createAttendee: Joi.ObjectSchema<any>;
    updateAttendee: Joi.ObjectSchema<any>;
    createAccommodation: Joi.ObjectSchema<any>;
    createBuilding: Joi.ObjectSchema<any>;
    createRoom: Joi.ObjectSchema<any>;
    updateRoom: Joi.ObjectSchema<any>;
    createBus: Joi.ObjectSchema<any>;
    updateBus: Joi.ObjectSchema<any>;
    assignAttendee: Joi.ObjectSchema<any>;
    bulkAssignment: Joi.ObjectSchema<any>;
    user: Joi.ObjectSchema<any>;
    userUpdate: Joi.ObjectSchema<any>;
    communication: Joi.ObjectSchema<any>;
    createForm: Joi.ObjectSchema<any>;
};
//# sourceMappingURL=validation.d.ts.map