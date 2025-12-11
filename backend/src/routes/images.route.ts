import { Router } from "express";
import {
  previewHandler,
  thumbnailHandler,
} from "../controllers/images.controller";

const router = Router();

router.get("/image-preview/:id", previewHandler);
router.get("/image-thumbnail/:id", thumbnailHandler);

export default router;
