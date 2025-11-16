import { Router } from "express";
import { basicHealth, detailedHealth } from "../controllers/HealthController";

const router = Router();

/**
 * Health Check
 */
router.get("/", basicHealth);
router.get("/detailed", detailedHealth);

export default router;
