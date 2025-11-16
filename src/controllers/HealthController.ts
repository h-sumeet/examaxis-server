import type { NextFunction, Request, Response } from "express";
import { config } from "../config/app";
import { healthCheck } from "../config/database";
import { logger } from "../helpers/logger";
import { testConnection } from "../services/EmailService";
import { formatTimestamp, formatUptime } from "../utils/dayjs";
import { sendSuccess } from "../utils/response";

/**
 * Build base health object
 */
const getBaseHealth = () => ({
  status: "healthy",
  timestamp: formatTimestamp(),
  uptime: formatUptime(process.uptime()),
  environment: config.nodeEnv,
  version: config.version,
});

/**
 * Basic Health Check Handler
 */
export const basicHealth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const health = getBaseHealth();
    sendSuccess(res, "Service is healthy", health);
  } catch (error) {
    logger.error("Health check failed", { error });
    next(error);
  }
};

/**
 * Detailed Health Check Handler
 */
export const detailedHealth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const checks = {
    database: false,
    email: false,
  };

  try {
    // Database check using Prisma
    try {
      checks.database = await healthCheck();
    } catch (error) {
      logger.error("Database health check failed", { error });
    }

    // Email service check
    try {
      checks.email = await testConnection();
    } catch (error) {
      logger.error("Email health check failed", { error });
    }

    // Final response - only return essential health status
    const allHealthy = checks.database && checks.email;
    const status = allHealthy ? "healthy" : "degraded";

    sendSuccess(res, "Health check successful", {
      ...getBaseHealth(),
      status,
      checks,
    });
  } catch (error) {
    logger.error("Detailed health check failed", { error });
    next(error);
  }
};
