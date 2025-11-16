import nodemailer from "nodemailer";
import { config } from "../config/app";
import type { EmailTemplate } from "../types/email";
import { logger } from "../helpers/logger";
import { throwError } from "../utils/response";

/**
 * Create email transporter instance
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.password,
    },
  });
};

// Create a singleton transporter instance
const transporter = createTransporter();

/**
 * Send email
 */
export const sendEmail = async (
  to: string,
  template: EmailTemplate
): Promise<void> => {
  try {
    await transporter.sendMail({
      from: config.email.from,
      to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });
  } catch (error) {
    logger.error("Email sending failed", { error });
    throwError("Failed to send email");
  }
};

/**
 * Test email connection
 */
export const testConnection = async (): Promise<boolean> => {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    logger.error("Email service connection test failed", { error });
    return false;
  }
};

/**
 * Get transporter for advanced usage
 */
export const getTransporter = () => transporter;
