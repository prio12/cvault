import { Response } from "express";
import prisma from "../lib/db";
import { AuthenticatedRequest } from "../middleware/auth";

export const ATTRIBUTE_CATEGORIES = [
  "Certification",
  "Domain Knowledge",
  "Personal Information",
  "Soft Skills",
  "Language",
  "Technical Skills",
] as const;

export const getAttributes = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { search, category } = req.query;

  const attributes = await prisma.attribute.findMany({
    where: {
      ...(search
        ? { name: { startsWith: String(search), mode: "insensitive" } }
        : {}),
      ...(category ? { category: String(category) } : {}),
    },
    orderBy: { name: "asc" },
  });

  res.json(attributes);
};

export const createAttribute = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const { name, category, dataType, description, options } = req.body;

  if (!name || !category || !dataType) {
    return res
      .status(400)
      .json({ error: "name, category and dataType are required" });
  }

  try {
    const attribute = await prisma.attribute.create({
      data: {
        name,
        category,
        dataType,
        description,
        options: Array.isArray(options) ? options : [],
      },
    });
    res.status(201).json(attribute);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res
        .status(400)
        .json({ error: "An attribute with this name already exists" });
    }
    console.error("Error creating attribute:", err);
    res.status(500).json({ error: "Failed to create attribute" });
  }
};

export const updateAttribute = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const id = String(req.params.id);
  const { name, category, dataType, description, options } = req.body;

  try {
    const attribute = await prisma.attribute.update({
      where: { id },
      data: {
        name,
        category,
        dataType,
        description,
        options: Array.isArray(options) ? options : [],
      },
    });
    res.json(attribute);
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Attribute not found" });
    }
    if (err.code === "P2002") {
      return res
        .status(400)
        .json({ error: "An attribute with this name already exists" });
    }
    console.error("Error updating attribute:", err);
    res.status(500).json({ error: "Failed to update attribute" });
  }
};

export const deleteAttribute = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const id = String(req.params.id);

  try {
    await prisma.attribute.delete({ where: { id } });
    res.status(204).send();
  } catch (err: any) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Attribute not found" });
    }
    console.error("Error deleting attribute:", err);
    res.status(500).json({ error: "Failed to delete attribute" });
  }
};
