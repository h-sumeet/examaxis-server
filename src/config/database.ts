import { logger } from "../helpers/logger";
import { prisma } from "./prisma";

// Database connection state
let isConnected = false;

/**
 * Connect to MongoDB using Prisma
 */
export const connect = async (): Promise<void> => {
  if (isConnected) {
    logger.info("Database already connected");
    return;
  }

  try {
    // Test the connection
    await prisma.$connect();
    isConnected = true;
    logger.info("Prisma connected to MongoDB successfully");
  } catch (error) {
    logger.error("Failed to connect to MongoDB via Prisma", {
      error: error instanceof Error ? error.message : String(error),
    });
    isConnected = false;
    throw error;
  }
};

/**
 * Disconnect from MongoDB
 */
export const disconnect = async (): Promise<void> => {
  if (!isConnected) {
    return;
  }

  try {
    await prisma.$disconnect();
    isConnected = false;
    logger.info("Prisma disconnected from MongoDB");
  } catch (error) {
    logger.error("Error disconnecting Prisma", {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
};

/**
 * Get current database connection status
 */
export const getConnectionStatus = (): boolean => isConnected;

/**
 * Reset connection state (for testing)
 */
export const resetConnectionState = (): void => {
  isConnected = false;
};

/**
 * Health check - verify database is accessible
 */
export const healthCheck = async (): Promise<boolean> => {
  try {
    await prisma.$connect();
    return true;
  } catch (error) {
    logger.error("Database health check failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
};
