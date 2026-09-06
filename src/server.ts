import mongoose from "mongoose";
import dns from 'dns';
import { Server } from "http";
const delayedExit = (code: number = 1, timeout: number = 500): void => {
    setTimeout(() => process.exit(code), timeout);
};

// ==========================================
// Phase 1: TEMPORARY STARTUP GUARD
// ==========================================
process.on('uncaughtException', (err: Error) => {
    console.error('[STARTUP] STARTUP EXCEPTION! Shutting down...', err);
    delayedExit();
});

// the above gaurd will catch it if any problem happen with the require
import ENV from "./config/env";//this should be in top cause below dbConnect using the env.js 
import dbConnect from "./config/dbConnect";
import logger from "./config/logger";
import app from "./app";

// ==========================================
// Phase 2: OVERRIDE WITH PRO LOGGER GUARD
// ==========================================
// 1. Remove The Old (Temporary) guard 
process.removeAllListeners('uncaughtException');

// 2. Attach the new Pino Logger
process.on('uncaughtException', (err) => {
    logger.fatal({ err }, '[CRASH] UNCAUGHT EXCEPTION! Shutting down...');
    delayedExit(1)
});
// ==========================================
// 2. DNS FIX FOR MONGO ATLAS
// ==========================================
dns.setServers(['1.1.1.1', '8.8.8.8']);

let server: Server;

// ==========================================
// 3. ASYNC STARTUP (DB First,any other necessary services then finally App starts)
// ==========================================
async function startServer(): Promise<void> {
    try {
        //First we have to connect with db
        await dbConnect();
        logger.info('[DATABASE] connection successful.');

        //then start server
        server = app.listen(ENV.PORT, () => {
            logger.info(`[STARTUP] Server is running on ${ENV.PORT} in ${ENV.NODE_ENV} mode.`);
        });

    } catch (err) {
        logger.fatal({ err }, '[CRASH] Server startup aborted due to database failure.');
        delayedExit(1)
    }
};

startServer()

// ==========================================
// 4. UNHANDLED REJECTIONS & SHUTDOWN
// ==========================================
process.on('unhandledRejection', (err: Error) => {
    logger.fatal({ err }, '[CRASH] UNHANDLED REJECTION! Shutting down...');
    if (server) {
        server.close(() => delayedExit(1));
    } else {
        delayedExit(1);
    }
});
process.on('SIGTERM', () => {
    logger.info('[INFO] SIGTERM RECEIVED. Shutting down gracefully...');
    if (server) {
        server.close(async () => {
            logger.info('[INFO] Server closed (No new requests).');
            if (mongoose.connection.readyState === 1) await mongoose.connection.close();
            delayedExit(0);
        })
    } else {
        logger.info('[INFO] Server was not fully started. Terminating immediately.');
        delayedExit(0);//safe Exit
    }
});