export type AiStatus = "generated" | "fallback_used" | "disabled" | "not_requested";

export type JsonObject = Record<string, unknown>;

export type CreateWeatherRequestData = {
  locationInput: string;
  resolvedLocationName: string;
  country?: string | null;
  latitude: number;
  longitude: number;
  startDate: Date;
  endDate: Date;
  currentWeatherJson: JsonObject;
  forecastJson: JsonObject;
  weatherProfileJson: JsonObject;
  travelInsightsJson: JsonObject;
  packingChecklistJson: JsonObject;
  aiRecommendationJson?: JsonObject | null;
  aiStatus?: AiStatus;
};

export type UpdateWeatherRequestData = Partial<CreateWeatherRequestData>;

export type ListWeatherRequestsFilters = {
  location?: string;
  country?: string;
  limit?: number;
  offset?: number;
};
