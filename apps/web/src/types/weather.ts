export type AiStatus = "generated" | "fallback_used" | "disabled" | "not_requested";

export type RiskLevel = "low" | "moderate" | "high";

export type CurrentWeather = {
  temperatureC: number | null;
  feelsLikeC: number | null;
  condition: string | null;
  weatherCode: number | null;
  windSpeedKmh: number | null;
  windGustKmh: number | null;
  precipitationProbabilityPercent: number | null;
  isDay: boolean | null;
  observedAt: string | null;
};

export type ForecastDay = {
  date: string;
  minTemperatureC: number | null;
  maxTemperatureC: number | null;
  precipitationProbabilityMaxPercent: number | null;
  rainSumMm: number | null;
  snowfallSumCm: number | null;
  windSpeedMaxKmh: number | null;
  windGustsMaxKmh: number | null;
  uvIndexMax: number | null;
  weatherCode: number | null;
  condition: string | null;
};

export type WeatherProfile = {
  mainScenario: string;
  riskLevel: RiskLevel;
  detectedConditions: string[];
  summary: string;
};

export type PackingChecklist = {
  clothing: string[];
  weatherProtection: string[];
  accessories: string[];
  healthAndSafety: string[];
  optional: string[];
};

export type AiRecommendation = {
  summary: string;
  packingChecklist: PackingChecklist;
  travelInsights: string[];
} | null;

export type WeatherRequest = {
  id: string;
  locationInput: string;
  resolvedLocationName: string;
  country: string | null;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  currentWeather: CurrentWeather;
  forecast: ForecastDay[];
  weatherProfile: WeatherProfile;
  travelInsights: string[];
  packingChecklist: PackingChecklist;
  aiRecommendation: AiRecommendation;
  aiStatus: AiStatus;
  createdAt: string;
  updatedAt: string;
};

export type ApiSuccess<T> = {
  data: T;
  warning?: {
    code: string;
    message: string;
  };
};

export type ApiListSuccess<T> = {
  data: T[];
  meta: {
    limit?: number;
    offset?: number;
    count: number;
    exportedAt?: string;
  };
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
