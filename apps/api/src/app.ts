import cors from "cors";
import express from "express";

import { errorHandler } from "./middleware/errorHandler.js";
import { devRouter } from "./routes/dev.routes.js";
import { healthRouter } from "./routes/health.routes.js";
import { weatherRequestsRouter } from "./routes/weatherRequests.routes.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/api/health", healthRouter);
  app.use("/api/dev", devRouter);
  app.use("/api/weather-requests", weatherRequestsRouter);

  app.use(errorHandler);

  return app;
}
