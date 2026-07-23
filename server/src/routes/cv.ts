import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  createCV,
  getMyCVs,
  getCVDetail,
  updateCVAttribute,
  publishCV,
  deleteCV,
} from "../controllers/cvController";

const router = Router();

router.post("/", requireAuth, createCV);
router.get("/mine", requireAuth, getMyCVs);
router.get("/:id", requireAuth, getCVDetail);
router.put("/:id/attributes/:attributeId", requireAuth, updateCVAttribute);
router.patch("/:id/publish", requireAuth, publishCV);
router.delete("/:id", requireAuth, deleteCV);

export default router;
