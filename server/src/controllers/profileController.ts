import { Response } from "express";
import prisma from "../lib/db";
import { AuthenticatedRequest } from "../middleware/auth";

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      user: { select: { name: true, avatarUrl: true, email: true } },
    },
  });

  if (!profile) {
    return res.status(404).json({ error: "Profile not found" });
  }

  res.json({
    name: profile.user.name,
    avatarUrl: profile.user.avatarUrl,
    email: profile.user.email,
    location: profile.location,
    version: profile.version,
  });
};

export const updateMe = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { name, location, avatarUrl, version } = req.body;

  if (typeof version !== "number") {
    return res.status(400).json({ error: "version (number) is required" });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const updateResult = await tx.profile.updateMany({
        where: { userId, version },
        data: {
          version: { increment: 1 },
          ...(location !== undefined ? { location } : {}),
        },
      });

      if (updateResult.count === 0) {
        const current = await tx.profile.findUnique({
          where: { userId },
          include: { user: { select: { name: true, avatarUrl: true } } },
        });
        throw Object.assign(new Error("VERSION_CONFLICT"), { current });
      }

      if (name !== undefined || avatarUrl !== undefined) {
        await tx.user.update({
          where: { id: userId },
          data: {
            ...(name !== undefined ? { name } : {}),
            ...(avatarUrl !== undefined ? { avatarUrl } : {}),
          },
        });
      }

      return tx.profile.findUnique({
        where: { userId },
        include: { user: { select: { name: true, avatarUrl: true } } },
      });
    });

    res.json({
      name: result!.user.name,
      avatarUrl: result!.user.avatarUrl,
      location: result!.location,
      version: result!.version,
    });
  } catch (err: any) {
    if (err.message === "VERSION_CONFLICT") {
      return res.status(409).json({
        error: "Profile was updated elsewhere. Refresh and retry.",
        current: {
          name: err.current?.user?.name,
          avatarUrl: err.current?.user?.avatarUrl,
          location: err.current?.location,
          version: err.current?.version,
        },
      });
    }
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};
