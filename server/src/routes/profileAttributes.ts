import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import {
  getProfileAttributes,
  addProfileAttribute,
  updateProfileAttribute,
  removeProfileAttribute,
} from "../controllers/profileAttributeController";

const router = Router();

router.get("/", requireAuth, getProfileAttributes);
router.post("/", requireAuth, addProfileAttribute);
router.put("/:attributeId", requireAuth, updateProfileAttribute);
router.delete("/:attributeId", requireAuth, removeProfileAttribute);

export default router;
