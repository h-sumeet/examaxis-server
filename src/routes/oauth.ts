import { Router } from "express";
import passport from "passport";
import "../config/passport";
import {
  exchangeCode,
  githubAuth,
  githubCallback,
  googleAuth,
  googleCallback,
} from "../controllers/OauthController";
import { oauthParamsSchema, validate } from "../middleware/validation";

const router = Router();

// Start flows
router.get(
  "/google/:redirectUrl",
  validate(oauthParamsSchema, "params"),
  googleAuth
);
router.get(
  "/github/:redirectUrl",
  validate(oauthParamsSchema, "params"),
  githubAuth
);

// Callbacks
router.get(
  "/callback/google",
  passport.authenticate("google", { session: false }),
  googleCallback
);
router.get(
  "/callback/github",
  passport.authenticate("github", { session: false }),
  githubCallback
);

router.get("/exchange-code", exchangeCode);

export default router;
