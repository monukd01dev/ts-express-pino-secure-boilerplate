import PinoHttp from "pino-http";
import logger from "../config/logger";
import { IncomingMessage, ServerResponse } from "http";

const requestLogger = PinoHttp({
    logger: logger,
    serializers: {
        req: (req: IncomingMessage) => {
            return {
                method: req.method,
                url: req.url,
                // headers: req.headers,
                // userAgent: req.headers['user-agent'] 
            };
        },
        res: (res: ServerResponse) => {
            return {
                statusCode: res.statusCode,
            };
        }
    },
    autoLogging: {
        ignore: (req: IncomingMessage) => req.url === '/api/v1/health' //we don't have to log this cause this is called by hosting platforms in every 10 sec
    },
    customSuccessMessage: function (req: IncomingMessage, res: ServerResponse): string {
        return `${req.method} request to ${req.url} completed`;
    },
    customErrorMessage: function (req: IncomingMessage, res: ServerResponse, err: Error): string {
        return `${req.method} request to ${req.url} FAILED`;
    }
});

export default requestLogger;