import { Request, Response } from "express";
import promises from "fs/promises";
import path from "path";
import PanoramaModel from "../models/Panorama";

export const previewHandler = async (req: Request, res: Response) => {
  const { id } = req.params;

  const image = await PanoramaModel.findOne({
    filename: id,
    deletedAt: { $exists: false },
  }).lean();

  if (!image) {
    return res.status(404).json({ error: "Image not found." });
  }
  const filePath = path.join(process.cwd(), image.path);

  try {
    await promises.access(filePath);
  } catch (error) {
    return res.status(404).json({ error: "Image not found on disk." });
  }
  res.setHeader("Content-Type", image.mimeType);
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${filePath.split("/").pop()}"`
  );

  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  res.sendFile(filePath, (err) => {
    if (err) console.error("Error sending file:", err);
  });
};

export const thumbnailHandler = async (req: Request, res: Response) => {
  const { id } = req.params;

  const image = await PanoramaModel.findOne({
    filename: id,
    deletedAt: { $exists: false },
  }).lean();

  if (!image) {
    return res.status(404).json({ error: "Image not found." });
  }
  const filePath = path.join(process.cwd(), image.thumbnailPath);

  try {
    await promises.access(filePath);
  } catch (error) {
    return res.status(404).json({ error: "Thumbnail not found on disk." });
  }
  res.setHeader("Content-Type", image.mimeType);
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${filePath.split("/").pop()}"`
  );

  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

  res.sendFile(filePath, (err) => {
    if (err) console.error("Error sending file:", err);
  });
};
