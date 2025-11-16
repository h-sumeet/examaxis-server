import { logger } from "./logger";
import { ENV } from "../constants/common";
import { config } from "../config/app";

export const sendDiscordAlert = async (message: string): Promise<void> => {
  if (config.nodeEnv === ENV["prod"] && config.discordAlert) {
    try {
      const response = await fetch(config.discordAlert, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `**Error in production: ${config.app.name}**\n\n${message}`,
        }),
      });

      if (!response.ok) {
        logger.error("Failed to send Discord alert:", response.statusText);
      }
    } catch (error) {
      logger.error("Failed to send Discord alert:", error);
    }
  }
};
