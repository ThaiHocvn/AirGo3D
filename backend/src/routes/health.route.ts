import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "AirGo3D Backend API",
    graphql: "/graphql",
  });
});

export default router;
