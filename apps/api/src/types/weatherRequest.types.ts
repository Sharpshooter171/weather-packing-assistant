import type { Prisma } from "@prisma/client";

export type AiStatus = "generated" | "fallback_used" | "disabled" | "not_requested";

export type CreateWeatherRequestData = Omit<
  Prisma.WeatherRequestCreateInput,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateWeatherRequestData = Prisma.WeatherRequestUpdateInput;

export type ListWeatherRequestsFilters = {
  location?: string;
  country?: string;
  limit?: number;
  offset?: number;
};
