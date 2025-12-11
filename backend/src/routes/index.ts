import { Express } from "express";
import imagesRouter from "./images.route";
import healthRoutes from "./health.route";

export default function routes(app: Express): void {
  app.use("/", healthRoutes);
  app.use("/api", imagesRouter);
}
