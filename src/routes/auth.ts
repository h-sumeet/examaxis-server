import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordSchema,
  tokenHeaderSchema,
  updateProfileSchema,
  validate,
  verifyEmailSchema,
} from "../middleware/validation";
import {
  forgotPassword,
  getProfile,
  login,
  logout,
  logoutAll,
  refreshToken,
  register,
  resetPassword,
  updateProfile,
  verifyEmail,
} from "../controllers/UserController";

const router = Router();

// Public routes
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshTokenSchema, "headers"), refreshToken);
router.post("/verify-email", validate(verifyEmailSchema), verifyEmail);
router.post("/forgot", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset", validate(resetPasswordSchema), resetPassword);

// Protected routes require authentication
router.use(validate(tokenHeaderSchema, "headers"), authenticate);

router.get("/profile", getProfile);
router.put("/profile", validate(updateProfileSchema), updateProfile);
router.post("/logout", logout);
router.post("/logout-all", logoutAll);

export default router;
