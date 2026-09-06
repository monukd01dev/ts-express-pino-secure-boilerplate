import { StatusCodes } from "http-status-codes";
import ENV from "./env";
import { CorsOptions } from 'cors';
const ALLOWED_HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
const ALLOWED_HTTP_HEADERS = ['Content-Type', 'Authorization']

const corsOptions:CorsOptions = {
    origin: ENV.CORS_ORIGIN,
    methods: ALLOWED_HTTP_METHODS,
    allowedHeaders: ALLOWED_HTTP_HEADERS,
    credentials: true,
    optionsSuccessStatus: StatusCodes.OK
}

export default corsOptions;