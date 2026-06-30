export type DetectedCondition =
  | "hot"
  | "very_hot"
  | "mild"
  | "cool"
  | "cold"
  | "very_cold"
  | "rain"
  | "heavy_rain"
  | "snow"
  | "heavy_snow"
  | "fog"
  | "strong_wind"
  | "storm"
  | "high_uv"
  | "large_temperature_variation"
  | "mixed_conditions";

export type RiskLevel = "low" | "moderate" | "high";

export type NormalizedWeatherSummary = {
  minTemperatureC: number;
  maxTemperatureC: number;
  apparentTemperatureMinC?: number | null;
  apparentTemperatureMaxC?: number | null;
  rainProbabilityMaxPercent?: number | null;
  rainSumMaxMm?: number | null;
  precipitationProbabilityMaxPercent?: number | null;
  snowfallExpected: boolean;
  snowfallMaxCm?: number | null;
  windSpeedMaxKmh?: number | null;
  windGustMaxKmh?: number | null;
  uvIndexMax?: number | null;
  visibilityMinMeters?: number | null;
  weatherCodes: number[];
  temperatureVariationC: number;
};

export type PackingChecklist = {
  clothing: string[];
  weatherProtection: string[];
  accessories: string[];
  healthAndSafety: string[];
  optional: string[];
};

export type WeatherProfile = {
  mainScenario: string;
  riskLevel: RiskLevel;
  detectedConditions: DetectedCondition[];
  summary: string;
};

export type RuleEngineOutput = {
  weatherProfile: WeatherProfile;
  travelInsights: string[];
  packingChecklist: PackingChecklist;
};
