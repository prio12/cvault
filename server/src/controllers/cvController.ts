import { Response } from "express";
import prisma from "../lib/db";
import { AuthenticatedRequest } from "../middleware/auth";
import { validateAttributeValue } from "../lib/validateAttributeValue";

export const createCV = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { positionId } = req.body;

  if (!positionId) {
    return res.status(400).json({ error: "positionId is required" });
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) return res.status(404).json({ error: "Profile not found" });

  try {
    const existing = await prisma.cV.findUnique({
      where: { profileId_positionId: { profileId: profile.id, positionId } },
    });
    if (existing) {
      return res.status(200).json(existing);
    }

    const created = await prisma.cV.create({
      data: { profileId: profile.id, positionId },
    });
    res.status(201).json(created);
  } catch (err) {
    console.error("Error creating CV:", err);
    res.status(500).json({ error: "Failed to create CV" });
  }
};

export const getMyCVs = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) return res.status(404).json({ error: "Profile not found" });

  const cvs = await prisma.cV.findMany({
    where: { profileId: profile.id },
    include: {
      position: { select: { title: true, company: true } },
      _count: { select: { likes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(cvs);
};

export const getCVDetail = async (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const requester = req.user!;

  const cv = await prisma.cV.findUnique({
    where: { id },
    include: {
      profile: { include: { user: { select: { id: true, name: true } } } },
      position: {
        include: {
          attributes: {
            include: { attribute: true },
            orderBy: { orderIndex: "asc" },
          },
        },
      },
    },
  });

  if (!cv) return res.status(404).json({ error: "CV not found" });

  const isOwner = cv.profile.user.id === requester.id;
  const isAdmin = requester.role === "ADMIN";
  const isRecruiter = requester.role === "RECRUITER";

  if (!isOwner && !isAdmin) {
    if (!isRecruiter || cv.status !== "PUBLISHED") {
      return res.status(403).json({ error: "Not authorized to view this CV" });
    }
  }

  const attributeIds = cv.position.attributes.map((pa) => pa.attributeId);

  const profileValues = await prisma.profileAttribute.findMany({
    where: { profileId: cv.profileId, attributeId: { in: attributeIds } },
  });
  const valueMap = new Map(
    profileValues.map((pv) => [pv.attributeId, pv.value]),
  );

  const attributes = cv.position.attributes.map((pa) => ({
    attributeId: pa.attributeId,
    name: pa.attribute.name,
    category: pa.attribute.category,
    dataType: pa.attribute.dataType,
    options: pa.attribute.options,
    value: valueMap.get(pa.attributeId) ?? null,
  }));

  res.json({
    id: cv.id,
    status: cv.status,
    createdAt: cv.createdAt,
    candidateName: cv.profile.user.name,
    location: cv.profile.location,
    canEdit: isOwner || isAdmin,
    position: {
      id: cv.position.id,
      title: cv.position.title,
      company: cv.position.company,
      level: cv.position.level,
    },
    attributes,
  });
};

export const updateCVAttribute = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const id = String(req.params.id);
  const attributeId = String(req.params.attributeId);
  const { value } = req.body;
  const requester = req.user!;

  const cv = await prisma.cV.findUnique({
    where: { id },
    include: { profile: { include: { user: { select: { id: true } } } } },
  });
  if (!cv) return res.status(404).json({ error: "CV not found" });

  const isOwner = cv.profile.user.id === requester.id;
  const isAdmin = requester.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: "Not authorized to edit this CV" });
  }

  const attribute = await prisma.attribute.findUnique({
    where: { id: attributeId },
  });
  if (!attribute) return res.status(404).json({ error: "Attribute not found" });

  const validationError = validateAttributeValue(
    attribute.dataType,
    value,
    attribute.options,
  );
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const updated = await prisma.profileAttribute.upsert({
    where: { profileId_attributeId: { profileId: cv.profileId, attributeId } },
    update: { value },
    create: { profileId: cv.profileId, attributeId, value },
  });

  res.json({ attributeId, value: updated.value });
};

export const publishCV = async (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const requester = req.user!;

  const cv = await prisma.cV.findUnique({
    where: { id },
    include: {
      profile: { include: { user: { select: { id: true } } } },
      position: { include: { attributes: { include: { attribute: true } } } },
    },
  });
  if (!cv) return res.status(404).json({ error: "CV not found" });

  const isOwner = cv.profile.user.id === requester.id;
  const isAdmin = requester.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: "Not authorized to publish this CV" });
  }

  const attributeIds = cv.position.attributes.map((pa) => pa.attributeId);
  const values = await prisma.profileAttribute.findMany({
    where: { profileId: cv.profileId, attributeId: { in: attributeIds } },
  });
  const valueMap = new Map(values.map((v) => [v.attributeId, v.value]));

  const missing = cv.position.attributes
    .filter((pa) => {
      const v = valueMap.get(pa.attributeId);
      return v === undefined || v === null || v === "";
    })
    .map((pa) => pa.attribute.name);

  if (missing.length > 0) {
    return res.status(400).json({
      error: "Cannot publish: some attributes are still empty",
      missing,
    });
  }

  const updated = await prisma.cV.update({
    where: { id },
    data: { status: "PUBLISHED" },
  });

  res.json(updated);
};

export const deleteCV = async (req: AuthenticatedRequest, res: Response) => {
  const id = String(req.params.id);
  const requester = req.user!;

  const cv = await prisma.cV.findUnique({
    where: { id },
    include: { profile: { include: { user: { select: { id: true } } } } },
  });
  if (!cv) return res.status(404).json({ error: "CV not found" });

  const isOwner = cv.profile.user.id === requester.id;
  const isAdmin = requester.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ error: "Not authorized to delete this CV" });
  }

  await prisma.cV.delete({ where: { id } });
  res.status(204).send();
};
