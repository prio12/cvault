import { Response } from "express";
import prisma from "../lib/db";
import { AuthenticatedRequest } from "../middleware/auth";
import { validateAttributeValue } from "../lib/validateAttributeValue";

export const getProfileAttributes = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = req.user!.id;

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) return res.status(404).json({ error: "Profile not found" });

  const profileAttributes = await prisma.profileAttribute.findMany({
    where: { profileId: profile.id },
    include: { attribute: true },
    orderBy: { updatedAt: "desc" },
  });

  res.json(profileAttributes);
};

export const addProfileAttribute = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = req.user!.id;
  const { attributeId } = req.body;

  if (!attributeId) {
    return res.status(400).json({ error: "attributeId is required" });
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) return res.status(404).json({ error: "Profile not found" });

  try {
    const created = await prisma.profileAttribute.create({
      data: { profileId: profile.id, attributeId, value: null },
      include: { attribute: true },
    });
    res.status(201).json(created);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res
        .status(400)
        .json({ error: "Attribute already added to profile" });
    }
    console.error("Error adding profile attribute:", err);
    res.status(500).json({ error: "Failed to add attribute" });
  }
};

export const updateProfileAttribute = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = req.user!.id;
  const attributeId = String(req.params.attributeId);
  const { value } = req.body;

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) return res.status(404).json({ error: "Profile not found" });

  const existing = await prisma.profileAttribute.findUnique({
    where: { profileId_attributeId: { profileId: profile.id, attributeId } },
    include: { attribute: true },
  });
  if (!existing)
    return res.status(404).json({ error: "Attribute not found on profile" });

  const validationError = validateAttributeValue(
    existing.attribute.dataType,
    value,
    existing.attribute.options,
  );
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const updated = await prisma.profileAttribute.update({
      where: { profileId_attributeId: { profileId: profile.id, attributeId } },
      data: { value },
      include: { attribute: true },
    });
    res.json(updated);
  } catch (err: any) {
    console.error("Error updating profile attribute:", err);
    res.status(500).json({ error: "Failed to update attribute" });
  }
};
export const removeProfileAttribute = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const userId = req.user!.id;
  const attributeId = String(req.params.attributeId);

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) return res.status(404).json({ error: "Profile not found" });

  try {
    await prisma.profileAttribute.delete({
      where: { profileId_attributeId: { profileId: profile.id, attributeId } },
    });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Attribute not found on profile" });
    }
    console.error("Error removing profile attribute:", err);
    res.status(500).json({ error: "Failed to remove attribute" });
  }
};
