import { Request, Response, NextFunction } from "express";
import logger from "../logger";

export const defaultErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): any => {
  logger.error(err);

  return res
    .status(err.status || 500)
    .json({ error: err.message || "Internal server error" });
};

export const notFoundHandler = (req: Request, res: Response): any => {
  return res.status(404).json({ error: "Not found" });
};
