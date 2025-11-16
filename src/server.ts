import { startServer } from "./app";
import { sendDiscordAlert } from "./helpers/discord";
import { logger } from "./helpers/logger";

// Start the server
const server = await startServer();

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully...");
  process.exit(0);
});

process.on("unhandledRejection", async (error: Error) => {
  await sendDiscordAlert(error.message);
  logger.error("Unhandled Rejection", { error });
  process.exit(1);
});

process.on("uncaughtException", async (error: Error) => {
  await sendDiscordAlert(error.message);
  logger.error("Uncaught Exception", { error });
  process.exit(1);
});

export default server;
