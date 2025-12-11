import { createServer } from "http";
import app from "./app";
import connectDB from "./database";
import logger from "./logger";

// Connect DB
connectDB();

const httpServer = createServer(app);
const port = process.env.port || 4000;

httpServer.on("error", (error: NodeJS.ErrnoException) => {
  if (error.syscall !== "listen") {
    throw error;
  } else {
    throw error;
  }
});

httpServer.on("listening", () => {
  logger.info(`HTTP server listening at port ${port}`);
  logger.info(`GraphQL endpoint: http://localhost:${port}/graphql`);
});

httpServer.listen(port);

export default httpServer;
