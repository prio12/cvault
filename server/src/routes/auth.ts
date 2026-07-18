// src/routes/auth.ts
import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import { generateToken } from "../helpers";
import {
  githubCallback,
  googleCallback,
  login,
  register,
} from "../controllers/authController";

const router = Router();

router.post("/register", register);
router.post("/login", login);

//google provider
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  googleCallback,
);

//github provider
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    session: false,
  }),
  githubCallback,
);

export default router;
