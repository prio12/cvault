// src/routes/auth.ts
import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = Router();

const generateToken = (user: any): string => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
};

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
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`http://localhost:3000/auth-success?token=${token}`);
  },
);

//github provider
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"], session: false }),
);

router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`http://localhost:3000/auth-success?token=${token}`);
  },
);

export default router;
