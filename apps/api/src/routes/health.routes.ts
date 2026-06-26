import { Router } from "express";

export const healthRouter = Router();

healthRouter.get("/", (_request, response) => {
  response.status(200).json({
    data: {
      status: "ok",
      service: "weather-packing-assistant-api",
      version: "0.1"
    }
  });
});
