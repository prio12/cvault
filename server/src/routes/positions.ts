import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  getPositions,
  getPosition,
  createPosition,
  updatePosition,
  deletePosition,
  duplicatePosition,
} from "../controllers/positionController";

const router = Router();

router.get("/", getPositions);
router.get("/:id", getPosition);

router.post(
  "/",
  requireAuth,
  requireRole(["RECRUITER", "ADMIN"]),
  createPosition,
);
router.put(
  "/:id",
  requireAuth,
  requireRole(["RECRUITER", "ADMIN"]),
  updatePosition,
);
router.delete(
  "/:id",
  requireAuth,
  requireRole(["RECRUITER", "ADMIN"]),
  deletePosition,
);
router.post(
  "/:id/duplicate",
  requireAuth,
  requireRole(["RECRUITER", "ADMIN"]),
  duplicatePosition,
);

export default router;
