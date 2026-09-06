import rateLimit from "express-rate-limit";
import CONSTANTS from '../constants'
const { StatusCodes } = require('http-status-codes');

const globalLimiter = rateLimit({
    windowMs: CONSTANTS.RATE_LIMIT_WINDOW,
    max: CONSTANTS.GLOBAL_MAX_REQUESTS,
    standardHeaders: true, // `RateLimit-*` headers return karega (Modern browsers ke liye)
    legacyHeaders: false, // Purane `X-RateLimit-*` headers ko disable karega
    message: {
        status: StatusCodes.TOO_MANY_REQUESTS,
        error: CONSTANTS.ERRORS.RATE_LIMIT_EXCEEDED
    }
});

const authLimiter = rateLimit({
    windowMs: CONSTANTS.RATE_LIMIT_WINDOW,
    max: CONSTANTS.AUTH_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: StatusCodes.TOO_MANY_REQUESTS,
        error: CONSTANTS.ERRORS.RATE_LIMIT_EXCEEDED
    }
});

export { globalLimiter, authLimiter };   