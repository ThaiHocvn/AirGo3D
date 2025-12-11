import multer from "multer";
import * as path from "path";
import * as fs from "fs";
import logger from "../logger";

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

export const deleteFile = (filename: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const filePath = getFilePath(filename);

    const ext = path.extname(filename);
    const base = filename.replace(ext, "");
    const thumbnailName = `${base}-thumbnail${ext}`;
    const thumbnailPath = getFilePath(thumbnailName);

    let errorOccurred = false;

    const handleError = (err: any) => {
      if (!errorOccurred) {
        errorOccurred = true;
        logger.error(`Error deleting file(s):`, err);
        reject(err);
      }
    };

    fs.unlink(filePath, (err) => {
      if (err && err.code !== "ENOENT") return handleError(err);

      logger.info(`File deleted: ${filename}`);

      fs.unlink(thumbnailPath, (thumbErr) => {
        if (thumbErr && thumbErr.code !== "ENOENT")
          return handleError(thumbErr);

        logger.info(`Thumbnail deleted: ${thumbnailName}`);

        resolve();
      });
    });
  });
};

export { uploadDir };
