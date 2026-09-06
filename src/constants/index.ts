/**
 * Application-wide immutable constants.
 * Combines TypeScript's 'as const' for compile-time strictness 
 * with standard Object.freeze for runtime security.
 */

const CONSTANTS = Object.freeze({
    PAYLOAD_LIMIT: '10kb',
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 mins
    GLOBAL_MAX_REQUESTS: 100,
    AUTH_MAX_REQUESTS: 25,

    ERRORS: Object.freeze({
        ROUTE_NOT_FOUND: 'The requested resource was not found.',
        INTERNAL_SERVER: 'An unexpected internal server error occurred.',
        RATE_LIMIT_EXCEEDED: 'Too many requests from this IP, please try again later.'
    } as const)
} as const) ;

export default CONSTANTS;