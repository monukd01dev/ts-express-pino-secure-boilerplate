//pino logger
import ENV from './env';

import pino from 'pino';
const logger = pino({
    level: ENV.IS_DEVELOPMENT ? 'debug' : 'info',

    // 1. Redact configuration
    // 2. Password and JWT tokens are hide from logs
    redact: {
        paths: [
            'password',
            'req.body.password',
            'user.password',
            '*.password',
            'req.headers.authorization', // For Hiding JWT Token
            'token'
        ],
        censor: '[REDACTED : SECRET_DATA_HIDDEN]'
    },

    // Transport for development and production
    // Production :Logs are saved in file 
    // Development : Logs are printed in console
    transport: {
        targets: [
            // For console (Sirf Dev mode me)
            ...(ENV.IS_DEVELOPMENT ? [{
                target: 'pino-pretty',
                level: 'debug',
                options: {
                    colorize: true,
                    translateTime: 'SYS:standard',
                    ignore: 'pid,hostname',
                }
            }] : []),
            
            // for saving in file in both mode
            {
                target: 'pino/file',
                level: 'info',
                options: {
                    destination: './logs/app.log',
                    mkdir: true, // create log folder if its not there 
                }
            }
        ]
    }
});

export default logger;