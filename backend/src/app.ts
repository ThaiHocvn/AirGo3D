import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors, { CorsOptions } from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { graphqlUploadExpress } from "graphql-upload-ts";
import helmet from "helmet";
import morgan from "morgan";

import { envConfig, isProduction } from "./config/config";
import { resolvers } from "./graphql/resolvers";
import { typeDefs } from "./graphql/schema";
import logger from "./logger";
import {
  defaultErrorHandler,
  notFoundHandler,
} from "./middlewares/defaultErrorHandler";
import routes from "./routes";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  formatError: (err) => {
    logger.error("GraphQL Error:", err);
    return err;
  },
});
server.startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests();

const app = express();

// CORS
const corsOptions: CorsOptions = {
  origin: isProduction ? envConfig.clientUrl : "http://localhost:3000",
  credentials: false,
};

// Rate limit
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 500, // Limit each IP to 500 requests per `window` (here, per 10 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // store: ... , // Use an external store for more precise rate limiting
});

app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan("tiny") as express.RequestHandler);
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));
app.use(limiter);

app.use(
  "/graphql",
  graphqlUploadExpress({ maxFileSize: 100_000_000, maxFiles: 10 }),
  expressMiddleware(server, {
    context: async ({ req }) => ({ req }),
  })
);

// Routes
routes(app);

app.use(notFoundHandler);
app.use(defaultErrorHandler);

export default app;
