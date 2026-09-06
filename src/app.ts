import express, { Application, Request,Response } from 'express'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { requestLogger } from './middlewares';
import v1Router from './routes/v1';
import corsOptions from './config/corsConfig';
import { globalLimiter } from './config/rateLimiter';
import CONSTANTS from './constants';
import { notFoundHandler, globalErrorHandler } from './middlewares';
import { StatusCodes } from 'http-status-codes';

const app: Application = express();

// ==========================================
// 1. SECURITY & LOGGING MIDDLEWARES
// ==========================================

// Uncomment if hosting behind a reverse proxy (like Nginx, AWS ALB, Render, Heroku)
// It helps Express get the actual client IP address instead of the proxy's IP.
// app.set('trust proxy', 1); 

// Injects essential security headers (e.g., prevents XSS, clickjacking, MIME sniffing).
app.use(helmet());

// Enables Cross-Origin Resource Sharing. Defines which domains are allowed to talk to this API.
app.use(cors(corsOptions));

// Global Rate Limiting: Restricts the number of requests per IP to prevent DDoS and Brute-force attacks.
app.use(globalLimiter);

// Silently ignore browser noise before it reaches the logger or 404 handler
app.use('/favicon.ico', (req: Request, res: Response) => {
    res.status(StatusCodes.NO_CONTENT).end();
});
app.use('/.well-known', (req: Request, res: Response) => {
    res.status(StatusCodes.NO_CONTENT).end();
});

// HTTP Request Logger (Pino): Logs all incoming requests (method, url, status) to file/console.
app.use(requestLogger);


// ==========================================
// 2. BODY PARSERS & COOKIES
// ==========================================

// Parses incoming JSON payloads (req.body). 
// 'limit' prevents large payload attacks (e.g., someone sending a 500MB JSON to crash the server).
app.use(express.json({ limit: CONSTANTS.PAYLOAD_LIMIT }));

// Parses URL-encoded payloads (usually from HTML forms).
app.use(express.urlencoded({ extended: true, limit: CONSTANTS.PAYLOAD_LIMIT }));

// Parses Cookie header and populates req.cookies. Useful for handling JWTs stored in cookies.
app.use(cookieParser());


// ==========================================
// 3. API ROUTING
// ==========================================

// Mounts the primary API router under the '/api/v1' prefix. (e.g., /api/v1/users)
app.use('/api/v1', v1Router);


// ==========================================
// 4. ERROR HANDLING (MUST BE AT THE END)
// ==========================================

// Catch-all for routes that don't exist. Sends a formatted 404 response.
// If code reaches here, it means no router matched the requested URL.
app.use(notFoundHandler);

// Global Error Handler: Catches all next(err) calls across the application.
// Formats the error and sends a unified JSON error response to the client.
app.use(globalErrorHandler);


export default app;