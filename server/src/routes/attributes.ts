import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth";
import {
  getAttributes,
  createAttribute,
  updateAttribute,
  deleteAttribute,
} from "../controllers/attributeController";

const router = Router();

router.get("/", requireAuth, getAttributes);
router.post(
  "/",
  requireAuth,
  requireRole(["RECRUITER", "ADMIN"]),
  createAttribute,
);
router.put(
  "/:id",
  requireAuth,
  requireRole(["RECRUITER", "ADMIN"]),
  updateAttribute,
);
router.delete(
  "/:id",
  requireAuth,
  requireRole(["RECRUITER", "ADMIN"]),
  deleteAttribute,
);

export default router;
