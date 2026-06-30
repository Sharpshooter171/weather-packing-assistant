import type { Prisma } from "@prisma/client";

export type AiStatus = "generated" | "fallback_used" | "disabled" | "not_requested";

export type JsonValue = Prisma.InputJsonValue;

export type CreateWeatherRequestData = {
  locationInput: string;
  resolvedLocationName: string;
  country?: string | null;
  latitude: number;
  longitude: number;
  startDate: Date;
  endDate: Date;
  currentWeatherJson: JsonValue;
  forecastJson: JsonValue;
  weatherProfileJson: JsonValue;
  travelInsightsJson: JsonValue;
  packingChecklistJson: JsonValue;
  aiRecommendationJson?: JsonValue | null;
  aiStatus?: AiStatus;
};

export type UpdateWeatherRequestData = Partial<CreateWeatherRequestData>;

export type ListWeatherRequestsFilters = {
  location?: string;
  country?: string;
  limit?: number;
  offset?: number;
};
