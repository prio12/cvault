import { Response, Request } from "express";
import prisma from "../lib/db";
import { AuthenticatedRequest } from "../middleware/auth";

export const getPositions = async (req: Request, res: Response) => {
  const { search } = req.query;

  const positions = await prisma.position.findMany({
    where: search
      ? { title: { contains: String(search), mode: "insensitive" } }
      : undefined,
    include: {
      _count: { select: { cvs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json(positions);
};

export const getPosition = async (req: Request, res: Response) => {
  const id = String(req.params.id);

  const position = await prisma.position.findUnique({
    where: { id },
    include: {
      attributes: {
        include: { attribute: true },
        orderBy: { orderIndex: "asc" },
      },
      _count: { select: { cvs: true } },
    },
  });

  if (!position) {
    return res.status(404).json({ error: "Position not found" });
  }

  res.json(position);
};

export const createPosition = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const {
    title,
    company,
    description,
    level,
    isPublic,
    maxProjects,
    attributeIds,
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: "title is required" });
  }

  try {
    const position = await prisma.$transaction(async (tx) => {
      const created = await tx.position.create({
        data: {
          title,
          company,
          description,
          level,
          isPublic: isPublic ?? true,
          maxProjects: maxProjects ?? 3,
        },
      });

      if (Array.isArray(attributeIds) && attributeIds.length > 0) {
        await tx.positionAttribute.createMany({
          data: attributeIds.map((attributeId: string, index: number) => ({
            positionId: created.id,
            attributeId,
            orderIndex: index,
          })),
        });
      }

      return tx.position.findUnique({
        where: { id: created.id },
        include: { attributes: { include: { attribute: true } } },
      });
    });

    res.status(201).json(position);
  } catch (err) {
    console.error("Error creating position:", err);
    res.status(500).json({ error: "Failed to create position" });
  }
};

export const updatePosition = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const id = String(req.params.id);
  const {
    title,
    company,
    description,
    level,
    isPublic,
    maxProjects,
    attributeIds,
    version,
  } = req.body;

  if (typeof version !== "number") {
    return res.status(400).json({ error: "version (number) is required" });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const updateResult = await tx.position.updateMany({
        where: { id, version },
        data: {
          title,
          company,
          description,
          level,
          isPublic,
          maxProjects,
          version: { increment: 1 },
        },
      });

      if (updateResult.count === 0) {
        const current = await tx.position.findUnique({ where: { id } });
        throw Object.assign(new Error("VERSION_CONFLICT"), { current });
      }

      if (Array.isArray(attributeIds)) {
        await tx.positionAttribute.deleteMany({ where: { positionId: id } });
        if (attributeIds.length > 0) {
          await tx.positionAttribute.createMany({
            data: attributeIds.map((attributeId: string, index: number) => ({
              positionId: id,
              attributeId,
              orderIndex: index,
            })),
          });
        }
      }

      return tx.position.findUnique({
        where: { id },
        include: { attributes: { include: { attribute: true } } },
      });
    });

    res.json(result);
  } catch (err: any) {
    if (err.message === "VERSION_CONFLICT") {
      return res.status(409).json({
        error: "Position was updated elsewhere. Refresh and retry.",
        current: err.current,
      });
    }
    console.error("Error updating position:", err);
    res.status(500).json({ error: "Failed to update position" });
  }
};

export const deletePosition = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const id = String(req.params.id);

  try {
    await prisma.position.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Position not found" });
    }
    console.error("Error deleting position:", err);
    res.status(500).json({ error: "Failed to delete position" });
  }
};

export const duplicatePosition = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const id = String(req.params.id);

  try {
    const original = await prisma.position.findUnique({
      where: { id },
      include: { attributes: true },
    });

    if (!original) {
      return res.status(404).json({ error: "Position not found" });
    }

    const duplicate = await prisma.$transaction(async (tx) => {
      const created = await tx.position.create({
        data: {
          title: `${original.title} (Copy)`,
          company: original.company,
          description: original.description,
          level: original.level,
          isPublic: original.isPublic,
          maxProjects: original.maxProjects,
        },
      });

      if (original.attributes.length > 0) {
        await tx.positionAttribute.createMany({
          data: original.attributes.map((pa) => ({
            positionId: created.id,
            attributeId: pa.attributeId,
            orderIndex: pa.orderIndex,
          })),
        });
      }

      return tx.position.findUnique({
        where: { id: created.id },
        include: { attributes: { include: { attribute: true } } },
      });
    });

    res.status(201).json(duplicate);
  } catch (err) {
    console.error("Error duplicating position:", err);
    res.status(500).json({ error: "Failed to duplicate position" });
  }
};
