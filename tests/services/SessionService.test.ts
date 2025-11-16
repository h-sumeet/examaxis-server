import * as SessionService from "../../src/services/SessionService";
import * as JwtHelper from "../../src/helpers/jwt";
import { config } from "../../src/config/app";
import { prisma } from "../../src/config/prisma";

// Mock dependencies
jest.mock("../../src/config/prisma", () => ({
  prisma: {
    session: {
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));
jest.mock("../../src/helpers/jwt");

const mockedPrisma = prisma as jest.Mocked<typeof prisma>;
const mockedJwtHelper = JwtHelper as jest.Mocked<typeof JwtHelper>;

// Helper function to create clean mock user objects with only real fields
const createMockUser = (overrides: Partial<any> = {}): any => {
  const defaultUser = {
    id: "507f1f77bcf86cd799439011", // Valid MongoDB ObjectId
    fullName: "John Doe",
    emailInfo: {
      emailAddress: "john@example.com",
      isVerified: false,
      verificationToken: null,
      verificationExpires: null,
      pendingEmail: null,
      provider: "local",
    },
    phoneInfo: null,
    passwordInfo: {
      hash: "hashedpassword",
      resetToken: null,
      resetExpires: null,
    },
    lockoutInfo: {
      isLocked: false,
      lockedUntil: null,
      failedAttemptCount: 0,
    },
    profileImage: null,
    customFields: {},
    isActive: true,
    lastLoginAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return { ...defaultUser, ...overrides };
};

describe("SessionService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createSession", () => {
    it("should create session with refresh token successfully", async () => {
      const mockUser = createMockUser();
      const mockSession = {
        id: "session123",
        userId: mockUser.id,
        refreshToken: "hashed-refresh-token",
        userAgent: "test-agent",
        ipAddress: "127.0.0.1",
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      (mockedPrisma.session.create as jest.Mock).mockResolvedValue(mockSession);

      const result = await SessionService.createSession(
        mockUser,
        "test-agent",
        "127.0.0.1"
      );

      expect(mockedPrisma.session.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          refreshToken: expect.any(String), // hashed token
          userAgent: "test-agent",
          ipAddress: "127.0.0.1",
          expiresAt: expect.any(Date),
        },
      });
      expect(result.session).toBe(mockSession);
      expect(result.refreshToken).toBeDefined();
      expect(result.refreshToken).not.toBe("hashed-refresh-token"); // Should be plain token
    });

    it("should create session without userAgent and ipAddress", async () => {
      const mockUser = createMockUser();
      const mockSession = {
        id: "session123",
        userId: mockUser.id,
        refreshToken: "hashed-refresh-token",
        userAgent: null,
        ipAddress: null,
        expiresAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any;

      (mockedPrisma.session.create as jest.Mock).mockResolvedValue(mockSession);

      const result = await SessionService.createSession(mockUser);

      expect(mockedPrisma.session.create).toHaveBeenCalledWith({
        data: {
          userId: mockUser.id,
          refreshToken: expect.any(String),
          userAgent: null,
          ipAddress: null,
          expiresAt: expect.any(Date),
        },
      });
      expect(result.session).toBe(mockSession);
      expect(result.refreshToken).toBeDefined();
    });
  });

  describe("generateTokenPair", () => {
    it("should generate access token and create session", async () => {
      const mockUser = createMockUser();
      const mockAccessToken = "access-token-123";
      const mockSession = {
        _id: "session123",
        refreshToken: "plain-refresh-token",
      } as any;

      mockedJwtHelper.generateAccessToken.mockReturnValue(mockAccessToken);

      // Mock the createSession function
      const createSessionSpy = jest.spyOn(SessionService, "createSession");
      createSessionSpy.mockResolvedValue(mockSession);

      const result = await SessionService.generateTokenPair(
        mockUser,
        "test-agent",
        "127.0.0.1"
      );

      expect(mockedJwtHelper.generateAccessToken).toHaveBeenCalledWith(
        mockUser
      );
      expect(createSessionSpy).toHaveBeenCalledWith(
        mockUser,
        "test-agent",
        "127.0.0.1"
      );
      expect(result).toEqual({
        accessToken: "access-token-123",
        refreshToken: "plain-refresh-token",
        expiresIn: config.jwt.expiresIn,
      });
    });
  });

  describe("revokeRefreshToken", () => {
    it("should revoke refresh token successfully", async () => {
      const mockSession = {
        id: "session123",
        userId: "507f1f77bcf86cd799439011",
        refreshToken: "hashed-token",
      } as any;

      (mockedPrisma.session.delete as jest.Mock).mockResolvedValue(mockSession);

      await SessionService.revokeRefreshToken("refresh-token");

      expect(mockedPrisma.session.delete).toHaveBeenCalledWith({
        where: {
          refreshToken: expect.any(String), // hashed token
        },
      });
    });
  });

  describe("revokeAllUserSessions", () => {
    it("should revoke all user sessions successfully", async () => {
      const validUserId = "507f1f77bcf86cd799439011"; // Valid MongoDB ObjectId
      (mockedPrisma.session.deleteMany as jest.Mock).mockResolvedValue({
        count: 2,
      });

      await SessionService.revokeAllUserSessions(validUserId);

      expect(mockedPrisma.session.deleteMany).toHaveBeenCalledWith({
        where: {
          userId: validUserId,
        },
      });
    });
  });
});
