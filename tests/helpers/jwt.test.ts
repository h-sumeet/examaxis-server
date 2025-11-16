import jwt from "jsonwebtoken";
import { generateAccessToken, verifyAccessToken } from "../../src/helpers/jwt";
import { config } from "../../src/config/app";

// Mock the config module
jest.mock("../../src/config/app");
jest.mock("jsonwebtoken");

const mockedConfig = config as jest.Mocked<typeof config>;
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

describe("JWT Helpers", () => {
  const mockUser = {
    id: "507f1f77bcf86cd799439011",
    fullname: "John Doe",
    email: "test@example.com",
    phone: null,
    emailInfo: {
      isVerified: true,
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
    isActive: true,
    lastLoginAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock config values
    mockedConfig.jwt = {
      secret: "test-secret-key",
      refreshSecret: "test-refresh-secret",
      expiresIn: "15m",
      refreshExpiresIn: "7d", // 7 days
    };

    mockedConfig.app = {
      name: "CredLock",
      url: "http://localhost:3000",
    };
  });

  describe("generateAccessToken", () => {
    it("should generate access token with correct payload", () => {
      const expectedToken = "mock.jwt.token";
      const expectedPayload = {
        userId: mockUser.id,
        email: mockUser.email,
      };

      mockedJwt.sign.mockReturnValue(expectedToken as any);

      const result = generateAccessToken(mockUser);

      expect(result).toBe(expectedToken);
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        expectedPayload,
        mockedConfig.jwt.secret,
        {
          expiresIn: mockedConfig.jwt.expiresIn,
          issuer: mockedConfig.app.name,
          audience: mockedConfig.app.name,
          algorithm: "HS256",
        }
      );
    });

    it("should handle user with ObjectId _id", () => {
      const userWithObjectId = {
        ...mockUser,
        id: "507f1f77bcf86cd799439011" as any,
      };

      const expectedToken = "mock.jwt.token";
      mockedJwt.sign.mockReturnValue(expectedToken as any);

      const result = generateAccessToken(userWithObjectId);

      expect(result).toBe(expectedToken);
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "507f1f77bcf86cd799439011",
        }),
        mockedConfig.jwt.secret,
        expect.any(Object)
      );
    });

    it("should use correct JWT options", () => {
      const expectedToken = "mock.jwt.token";
      mockedJwt.sign.mockReturnValue(expectedToken as any);

      generateAccessToken(mockUser);

      expect(mockedJwt.sign).toHaveBeenCalledWith(
        expect.any(Object),
        mockedConfig.jwt.secret,
        {
          expiresIn: mockedConfig.jwt.expiresIn,
          issuer: mockedConfig.app.name,
          audience: mockedConfig.app.name,
          algorithm: "HS256",
        }
      );
    });
  });

  describe("verifyAccessToken", () => {
    it("should verify valid token successfully", () => {
      const mockToken = "valid.jwt.token";
      const expectedPayload = {
        userId: "507f1f77bcf86cd799439011",
        email: "test@example.com",
        fullname: "John Doe",
        iat: 1234567890,
        exp: 1234567890 + 900, // 15 minutes later
      };

      mockedJwt.verify.mockReturnValue(expectedPayload as any);

      const result = verifyAccessToken(mockToken);

      expect(result).toEqual(expectedPayload);
      expect(mockedJwt.verify).toHaveBeenCalledWith(
        mockToken,
        mockedConfig.jwt.secret,
        {
          issuer: mockedConfig.app.name,
          audience: mockedConfig.app.name,
          algorithms: ["HS256"],
        }
      );
    });

    it("should throw error for invalid token", () => {
      const mockToken = "invalid.jwt.token";

      mockedJwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      expect(() => verifyAccessToken(mockToken)).toThrow(
        "Invalid or expired access token"
      );
      expect(mockedJwt.verify).toHaveBeenCalledWith(
        mockToken,
        mockedConfig.jwt.secret,
        {
          issuer: mockedConfig.app.name,
          audience: mockedConfig.app.name,
          algorithms: ["HS256"],
        }
      );
    });

    it("should throw error for expired token", () => {
      const mockToken = "expired.jwt.token";

      mockedJwt.verify.mockImplementation(() => {
        throw new Error("TokenExpiredError");
      });

      expect(() => verifyAccessToken(mockToken)).toThrow(
        "Invalid or expired access token"
      );
      expect(mockedJwt.verify).toHaveBeenCalledWith(
        mockToken,
        mockedConfig.jwt.secret,
        {
          issuer: mockedConfig.app.name,
          audience: mockedConfig.app.name,
          algorithms: ["HS256"],
        }
      );
    });

    it("should throw error for malformed token", () => {
      const mockToken = "malformed.token";

      mockedJwt.verify.mockImplementation(() => {
        throw new Error("JsonWebTokenError");
      });

      expect(() => verifyAccessToken(mockToken)).toThrow(
        "Invalid or expired access token"
      );
      expect(mockedJwt.verify).toHaveBeenCalledWith(
        mockToken,
        mockedConfig.jwt.secret,
        {
          issuer: mockedConfig.app.name,
          audience: mockedConfig.app.name,
          algorithms: ["HS256"],
        }
      );
    });

    it("should use correct verification options", () => {
      const mockToken = "test.token";
      const expectedPayload = {
        userId: "507f1f77bcf86cd799439011",
        email: "test@example.com",
        fullname: "John Doe",
      };

      mockedJwt.verify.mockReturnValue(expectedPayload as any);

      verifyAccessToken(mockToken);

      expect(mockedJwt.verify).toHaveBeenCalledWith(
        mockToken,
        mockedConfig.jwt.secret,
        {
          issuer: mockedConfig.app.name,
          audience: mockedConfig.app.name,
          algorithms: ["HS256"],
        }
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle user with minimal required fields", () => {
      const minimalUser = {
        id: "507f1f77bcf86cd799439011" as any,
        fullname: "Minimal User",
        email: "minimal@example.com",
        phone: null,
        emailInfo: {
          isVerified: false,
          verificationToken: null,
          verificationExpires: null,
          pendingEmail: null,
          provider: "local",
        },
        phoneInfo: null,
        passwordInfo: {
          hash: "hash",
          resetToken: null,
          resetExpires: null,
        },
        lockoutInfo: {
          isLocked: false,
          lockedUntil: null,
          failedAttemptCount: 0,
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      const expectedToken = "minimal.jwt.token";
      mockedJwt.sign.mockReturnValue(expectedToken as any);

      const result = generateAccessToken(minimalUser);

      expect(result).toBe(expectedToken);
      expect(mockedJwt.sign).toHaveBeenCalledWith(
        {
          userId: minimalUser.id,
          email: minimalUser.email,
        },
        mockedConfig.jwt.secret,
        expect.any(Object)
      );
    });

    it("should handle empty string token", () => {
      const emptyToken = "";

      mockedJwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      expect(() => verifyAccessToken(emptyToken)).toThrow(
        "Invalid or expired access token"
      );
    });

    it("should handle null token", () => {
      const nullToken = null as any;

      mockedJwt.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      expect(() => verifyAccessToken(nullToken)).toThrow(
        "Invalid or expired access token"
      );
    });
  });
});
