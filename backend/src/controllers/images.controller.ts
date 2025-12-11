import { Request, Response } from "express";
import PanoramaModel from "../models/Panorama";
import { BUCKET, minioClient } from "../minioClient";

export const previewHandler = async (req: Request, res: Response) => {
  const { id } = req.params;

  const image = await PanoramaModel.findOne({ filename: id }).lean();
  if (!image) {
    return res.status(404).json({ error: "Image not found." });
  }

  const objectPath = `uploads/${image.filename}`;

  try {
    const stream = await minioClient.getObject(BUCKET, objectPath);

    res.setHeader("Content-Type", image.mimeType);
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${image.originalName}"`
    );

    stream.pipe(res);
  } catch (err) {
    console.error("MinIO getObject error:", err);
    return res.status(404).json({ error: "Image not found on MinIO." });
  }
};

export const thumbnailHandler = async (req: Request, res: Response) => {
  const { id } = req.params;

  const image = await PanoramaModel.findOne({
    filename: id.replace("-thumbnail", ""),
  }).lean();

  if (!image) {
    return res.status(404).json({ error: "Image not found." });
  }

  const thumbnailName = image.filename.replace(/(\.[^.]+)$/, "-thumbnail$1");
  const objectPath = `uploads/${thumbnailName}`;

  try {
    const stream = await minioClient.getObject(BUCKET, objectPath);

    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${image.originalName}"`
    );

    stream.pipe(res);
  } catch (err) {
    console.error("MinIO thumbnail error:", err);
    return res.status(404).json({ error: "Thumbnail not found on MinIO." });
  }
};
