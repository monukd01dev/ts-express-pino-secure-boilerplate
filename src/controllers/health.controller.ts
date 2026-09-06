import { StatusCodes } from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import ENV from "../config/env";

const healthCheck = async function (req: Request, res: Response, next: NextFunction) {
    try {
        const uptimeInSeconds = process.uptime();

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Server is Up and Running!!",
            data: {
                //for monitoring tools 
                uptime_seconds: uptimeInSeconds,
                uptime_human: `${Math.floor(uptimeInSeconds / 60)} minutes`,
                memory_usage_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
                timestamp: new Date().toISOString(),
                environment: ENV.NODE_ENV
            },
            error: null
        });
    } catch (error) {
        next(error)
    };

};

export default { healthCheck };