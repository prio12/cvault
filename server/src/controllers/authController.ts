import { Request, Response } from "express";
import prisma from "../lib/db";
import bcrypt from "bcryptjs";
import { generateToken } from "../helpers";

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ success: false, error: "Name,email and password are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: "CANDIDATE",
        profile: {
          create: {
            version: 0,
          },
        },
      },
    });

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error("Error during manual register:", error);

    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ success: false, error: "Email is already registered" });
    }

    res
      .status(500)
      .json({ success: false, error: "Registration failed. Server error." });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, error: "Email and password are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        error:
          "This account uses social login. Please sign in with Google or GitHub.",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Error during manual login:", error);
    res
      .status(500)
      .json({ success: false, error: "Login failed. Server error." });
  }
};

// Google Callback Controller
export const googleCallback = (req: Request, res: Response) => {
  if (!req.user) {
    return res.redirect(`${CLIENT_URL}/login?error=Unauthorized`);
  }

  const user = req.user as any;

  const token = generateToken(user);

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "CANDIDATE",
  };

  const encodedUser = encodeURIComponent(JSON.stringify(userData));
  res.redirect(`${CLIENT_URL}/auth-success?token=${token}&user=${encodedUser}`);
};

// GitHub Callback Controller
export const githubCallback = (req: Request, res: Response) => {
  if (!req.user) {
    return res.redirect(`${CLIENT_URL}/login?error=Unauthorized`);
  }

  const user = req.user as any;

  const token = generateToken(user);

  const userData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || "CANDIDATE",
  };

  const encodedUser = encodeURIComponent(JSON.stringify(userData));
  res.redirect(`${CLIENT_URL}/auth-success?token=${token}&user=${encodedUser}`);
};
