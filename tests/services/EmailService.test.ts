import nodemailer from "nodemailer";

// Mock nodemailer before importing EmailService
jest.mock("nodemailer");
const mockedNodemailer = nodemailer as jest.Mocked<typeof nodemailer>;

const mockTransporter = {
  sendMail: jest.fn(),
  verify: jest.fn(),
} as any;

// Set up the mock before importing EmailService
mockedNodemailer.createTransport.mockReturnValue(mockTransporter);

import { config } from "../../src/config/app";
import {
  generateEmailVerificationTemplate,
  generatePasswordResetTemplate,
} from "../../src/templates/emailTemplates";
import { sendEmail } from "../../src/services/EmailService";

describe("EmailService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendEmail", () => {
    it("should send email successfully", async () => {
      const mockTemplate = {
        subject: "Test Subject",
        text: "Test text content",
        html: "<p>Test html content</p>",
      };

      mockTransporter.sendMail.mockResolvedValue({ messageId: "test-id" });

      await sendEmail("test@example.com", mockTemplate);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith({
        from: config.email.from,
        to: "test@example.com",
        subject: mockTemplate.subject,
        text: mockTemplate.text,
        html: mockTemplate.html,
      });
    });

    it("should throw error when email sending fails", async () => {
      const mockTemplate = {
        subject: "Test Subject",
        text: "Test text content",
        html: "<p>Test html content</p>",
      };

      mockTransporter.sendMail.mockRejectedValue(new Error("SMTP Error"));

      await expect(sendEmail("test@example.com", mockTemplate)).rejects.toThrow(
        "Failed to send email"
      );
    });

    it("should handle network timeout errors", async () => {
      const mockTemplate = {
        subject: "Test Subject",
        text: "Test text content",
        html: "<p>Test html content</p>",
      };

      mockTransporter.sendMail.mockRejectedValue(new Error("ETIMEDOUT"));

      await expect(sendEmail("test@example.com", mockTemplate)).rejects.toThrow(
        "Failed to send email"
      );
    });
  });

  describe("generateEmailVerificationTemplate", () => {
    it("should generate email verification template", async () => {
      const fullname = "John Doe";
      const verificationToken = "abc123";
      const redirectUrl = "https://example.com";
      const template = await generateEmailVerificationTemplate(
        fullname,
        verificationToken,
        redirectUrl
      );

      expect(template).toHaveProperty("subject");
      expect(template).toHaveProperty("text");
      expect(template).toHaveProperty("html");
      expect(template.subject).toContain("Verify");
      expect(template.text).toContain(verificationToken);
      expect(template.html).toContain(verificationToken);
    });
  });

  describe("generatePasswordResetTemplate", () => {
    it("should generate password reset template", async () => {
      const fullname = "John Doe";
      const resetToken = "xyz789";
      const redirectUrl = "https://example.com";
      const template = await generatePasswordResetTemplate(
        fullname,
        resetToken,
        redirectUrl
      );

      expect(template).toHaveProperty("subject");
      expect(template).toHaveProperty("text");
      expect(template).toHaveProperty("html");
      expect(template.subject).toContain("Reset");
      expect(template.text).toContain(resetToken);
      expect(template.html).toContain(resetToken);
    });
  });
});
