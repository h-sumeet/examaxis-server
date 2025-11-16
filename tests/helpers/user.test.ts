import {
  hashPassword,
  comparePassword,
  generateVerificationToken,
  isAccountLocked,
} from "../../src/helpers/user";
import { config } from "../../src/config/app";

jest.mock("../../src/config/app");
jest.mock("bcryptjs");

const mockedConfig = config as jest.Mocked<typeof config>;

// Helper function to create clean mock users with only real fields
const createMockUser = (overrides: Partial<any> = {}) => {
  const defaultUser = {
    id: "user123",
    fullName: "John Doe",
    emailInfo: {
      emailAddress: "test@example.com",
      isVerified: false,
      verificationToken: null,
      verificationExpires: null,
      pendingEmail: null,
      provider: "local",
    },
    phoneInfo: null,
    passwordInfo: {
      hash: "hashedPassword123",
      resetToken: null,
      resetExpires: null,
    },
    lockoutInfo: {
      isLocked: false,
      lockedUntil: null,
      failedAttemptCount: 0,
    },
    customFields: {},
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    markModified: jest.fn(),
  };

  return { ...defaultUser, ...overrides } as any;
};

describe("User Helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedConfig.security = {
      bcryptRounds: 12,
      maxLoginAttempts: 5,
      loginLockTime: 3600000,
      maxRegistrationAttempts: 3,
      registrationLockTime: 3600000,
    };
  });

  describe("hashPassword", () => {
    it("should hash password with configured rounds", async () => {
      const password = "testPassword123";
      const hashedPassword = "hashedPassword123";

      const bcrypt = require("bcryptjs");
      bcrypt.genSalt.mockResolvedValue("salt123");
      bcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(bcrypt.genSalt).toHaveBeenCalledWith(
        mockedConfig.security.bcryptRounds
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(password, "salt123");
    });

    it("should handle empty password", async () => {
      const password = "";
      const hashedPassword = "hashedEmptyPassword";

      const bcrypt = require("bcryptjs");
      bcrypt.genSalt.mockResolvedValue("salt123");
      bcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await hashPassword(password);

      expect(result).toBe(hashedPassword);
      expect(bcrypt.genSalt).toHaveBeenCalledWith(
        mockedConfig.security.bcryptRounds
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(password, "salt123");
    });
  });

  describe("comparePassword", () => {
    it("should compare password with hash successfully", async () => {
      const mockUser = createMockUser();
      const inputPassword = "testPassword123";

      const bcrypt = require("bcryptjs");
      bcrypt.compare.mockResolvedValue(true);

      const result = await comparePassword(
        mockUser.passwordInfo.hash,
        inputPassword
      );

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        inputPassword,
        "hashedPassword123"
      );
    });

    it("should return false for incorrect password", async () => {
      const mockUser = createMockUser();
      const inputPassword = "wrongPassword";

      const bcrypt = require("bcryptjs");
      bcrypt.compare.mockResolvedValue(false);

      const result = await comparePassword(
        mockUser.passwordInfo.hash,
        inputPassword
      );

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        inputPassword,
        "hashedPassword123"
      );
    });
  });

  describe("generateVerificationToken", () => {
    it("should generate email verification token with days", async () => {
      const result = generateVerificationToken(1, "days");

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.hashed).toBeDefined();
      expect(result.expires).toBeDefined();
      expect(typeof result.token).toBe("string");
      expect(typeof result.hashed).toBe("string");
      expect(result.token.length).toBeGreaterThan(0);
      expect(result.hashed.length).toBeGreaterThan(0);
      expect(result.expires instanceof Date).toBe(true);
    });

    it("should generate phone verification token with minutes", async () => {
      const result = generateVerificationToken(10, "minutes");

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.hashed).toBeDefined();
      expect(result.expires).toBeDefined();
      expect(typeof result.token).toBe("string");
      expect(typeof result.hashed).toBe("string");
      expect(result.token.length).toBeGreaterThan(0);
      expect(result.hashed.length).toBeGreaterThan(0);
      expect(result.expires instanceof Date).toBe(true);
    });

    it("should default to minutes when unit is not specified", async () => {
      const result = generateVerificationToken(10);

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.hashed).toBeDefined();
      expect(result.expires).toBeDefined();
      expect(result.expires instanceof Date).toBe(true);
    });

    it("should generate different tokens for each call", async () => {
      const result1 = generateVerificationToken(1, "days");
      const result2 = generateVerificationToken(1, "days");

      expect(result1.token).not.toBe(result2.token);
      expect(result1.hashed).not.toBe(result2.hashed);
    });
  });

  describe("isAccountLocked", () => {
    it("should return false for unlocked account", () => {
      const mockUser = createMockUser();
      const result = isAccountLocked(mockUser);
      expect(result).toBe(false);
    });

    it("should return true for locked account", () => {
      const mockUser = createMockUser({
        lockoutInfo: {
          isLocked: true,
          lockedUntil: new Date(Date.now() + 1000), // Lock expires in 1 second
          failedAttemptCount: 5,
        },
      });

      const result = isAccountLocked(mockUser);
      expect(result).toBe(true);
    });
  });
});
