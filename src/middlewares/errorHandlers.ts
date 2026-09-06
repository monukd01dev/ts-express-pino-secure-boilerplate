import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";
import CONSTANTS from '../constants';
import AppError from '../utils/AppError';
import ENV from '../config/env';

// ==========================================
// THE TS SECRET: DECLARATION MERGING
// Tell TypeScript that Express Request object now has a 'log' property
// ==========================================
declare global {
    namespace Express {
        interface Request {
            log: any; // We use 'any' here for simplicity, or it could be imported from Pino
        }
    }
}

// ==========================================
// 1. 404 NOT FOUND HANDLER
// ==========================================
const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
    const error = new AppError(
        `The requested endpoint '${req.originalUrl}' does not exist on this server.`, 
        StatusCodes.NOT_FOUND
    );
    next(error);
};

// ==========================================
// 2. GLOBAL ERROR HANDLER
// ==========================================
const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {

    // FILTERING the stack trace
    let stackTrace = err.stack;
    if (stackTrace) {
        stackTrace = stackTrace
            .split('\n')
            .filter((line: string) => !line.includes('node_modules') && !line.includes('node:internal'))
            .join('\n');
    }

    // Extract to local constants instead of mutating the readonly 'err' object
    const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const errorStatus = err.status || 'error'; 

    // Pino error-logging (Using the local statusCode variable)
    if (statusCode >= 500) {
        req.log.error(err); 
    } else {
        req.log.warn(err.message); 
    }

    // Error Response according to the environment 
    if (ENV.IS_DEVELOPMENT) {
        return res.status(statusCode).json({
            success: false,
            message: err.message,
            data: null,
            error: {
                status: errorStatus,
                details: err,
                stackTrace: stackTrace // Using sanitized local variable
            }
        });
    } else {
        // Production: isOperational check
        if (err.isOperational) {
            return res.status(statusCode).json({
                success: false,
                message: err.message,
                data: null,
                error: {
                    status: errorStatus,
                }
            });
        } else {
            // Unknown errors 
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: CONSTANTS.ERRORS.INTERNAL_SERVER,
                data: null,
                error: {
                    status: 'error'
                }
            });
        }
    }
};

// FIX: ES6 Named Exports instead of module.exports
export {
    notFoundHandler,
    globalErrorHandler
};