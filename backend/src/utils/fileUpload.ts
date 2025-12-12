import * as fs from "fs";
import multer from "multer";
import * as path from "path";
import { BUCKET, minioClient } from "../minioClient";

const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `panorama-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, and WebP images are allowed."
      )
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

export const getFilePath = (filename: string): string => {
  return path.join(uploadDir, filename);
};

export const deleteFile = async (filename: string): Promise<void> => {
  const ext = filename.substring(filename.lastIndexOf("."));
  const base = filename.replace(ext, "");
  const thumbnailName = `${base}-thumbnail${ext}`;

  const filePath = `uploads/${filename}`;
  const thumbnailPath = `uploads/${thumbnailName}`;

  const p1 = minioClient.removeObject(BUCKET, filePath).catch((err: any) => {
    if (err.code !== "NoSuchKey") throw err;
    console.warn(`Main file not found: ${filePath}`);
  });

  const p2 = minioClient
    .removeObject(BUCKET, thumbnailPath)
    .catch((err: any) => {
      if (err.code !== "NoSuchKey") throw err;
      console.warn(`Thumbnail not found: ${thumbnailPath}`);
    });

  await Promise.all([p1, p2]);
};

export { uploadDir };
