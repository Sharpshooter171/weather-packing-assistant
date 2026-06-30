import type {
  DetectedCondition,
  NormalizedWeatherSummary,
  PackingChecklist,
  RiskLevel,
  RuleEngineOutput
} from "../types/weatherRules.types.js";
import { hasFogCode, hasHeavySnowCode, hasSnowCode, hasStormCode } from "../utils/weatherCodes.js";

const EMPTY_CHECKLIST: PackingChecklist = {
  clothing: [],
  weatherProtection: [],
  accessories: [],
  healthAndSafety: [],
  optional: []
};

export function buildDeterministicWeatherRecommendation(
  summary: NormalizedWeatherSummary
): RuleEngineOutput {
  const detectedConditions = detectConditions(summary);
  const riskLevel = classifyRiskLevel(detectedConditions);
  const packingChecklist = buildPackingChecklist(detectedConditions);
  const travelInsights = buildTravelInsights(detectedConditions);
  const mainScenario = selectMainScenario(detectedConditions);

  return {
    weatherProfile: {
      mainScenario,
      riskLevel,
      detectedConditions,
      summary: buildSummary(mainScenario, riskLevel, detectedConditions)
    },
    travelInsights,
    packingChecklist
  };
}

export function detectConditions(summary: NormalizedWeatherSummary): DetectedCondition[] {
  const conditions: DetectedCondition[] = [];

  if (summary.minTemperatureC <= 5) {
    conditions.push("very_cold");
  } else if (summary.minTemperatureC <= 12) {
    conditions.push("cold");
  } else if (summary.minTemperatureC <= 18) {
    conditions.push("cool");
  } else if (summary.maxTemperatureC >= 35) {
    conditions.push("very_hot");
  } else if (summary.maxTemperatureC >= 28) {
    conditions.push("hot");
  } else {
    conditions.push("mild");
  }

  const rainProbability = Math.max(
    summary.precipitationProbabilityMaxPercent ?? 0,
    summary.rainProbabilityMaxPercent ?? 0
  );
  const rainSum = summary.rainSumMaxMm ?? 0;

  if (rainProbability >= 70 || rainSum >= 10) {
    conditions.push("heavy_rain");
  } else if (rainProbability >= 40 || rainSum > 0) {
    conditions.push("rain");
  }

  const snowfallMaxCm = summary.snowfallMaxCm ?? 0;

  if (snowfallMaxCm >= 5 || hasHeavySnowCode(summary.weatherCodes)) {
    conditions.push("heavy_snow");
  } else if (summary.snowfallExpected || snowfallMaxCm > 0 || hasSnowCode(summary.weatherCodes)) {
    conditions.push("snow");
  }

  if ((summary.windGustMaxKmh ?? 0) >= 45 || (summary.windSpeedMaxKmh ?? 0) >= 35) {
    conditions.push("strong_wind");
  }

  if ((summary.uvIndexMax ?? 0) >= 7) {
    conditions.push("high_uv");
  }

  if ((summary.visibilityMinMeters ?? Number.POSITIVE_INFINITY) <= 1000 || hasFogCode(summary.weatherCodes)) {
    conditions.push("fog");
  }

  if (hasStormCode(summary.weatherCodes)) {
    conditions.push("storm");
  }

  if (summary.temperatureVariationC >= 12) {
    conditions.push("large_temperature_variation");
  }

  if (countMajorConditionGroups(conditions) >= 3) {
    conditions.push("mixed_conditions");
  }

  return dedupe(conditions);
}

function classifyRiskLevel(conditions: DetectedCondition[]): RiskLevel {
  if (
    conditions.includes("heavy_rain") ||
    conditions.includes("heavy_snow") ||
    conditions.includes("storm") ||
    conditions.includes("very_hot") ||
    (conditions.includes("very_cold") &&
      (conditions.includes("snow") || conditions.includes("heavy_snow") || conditions.includes("strong_wind")))
  ) {
    return "high";
  }

  if (
    conditions.includes("rain") ||
    conditions.includes("cold") ||
    conditions.includes("hot") ||
    conditions.includes("strong_wind") ||
    conditions.includes("high_uv") ||
    conditions.includes("large_temperature_variation")
  ) {
    return "moderate";
  }

  return "low";
}

function buildPackingChecklist(conditions: DetectedCondition[]): PackingChecklist {
  const checklist: PackingChecklist = structuredClone(EMPTY_CHECKLIST);

  for (const condition of conditions) {
    addItemsForCondition(checklist, condition);
  }

  return {
    clothing: dedupe(checklist.clothing),
    weatherProtection: dedupe(checklist.weatherProtection),
    accessories: dedupe(checklist.accessories),
    healthAndSafety: dedupe(checklist.healthAndSafety),
    optional: dedupe(checklist.optional)
  };
}

function addItemsForCondition(checklist: PackingChecklist, condition: DetectedCondition) {
  switch (condition) {
    case "very_cold":
      checklist.clothing.push("Heavy coat", "Thermal base layer", "Sweater or hoodie", "Warm socks");
      checklist.weatherProtection.push("Insulated or waterproof shoes");
      checklist.accessories.push("Gloves", "Beanie", "Scarf");
      break;
    case "cold":
      checklist.clothing.push("Warm jacket", "Sweater or hoodie", "Long pants", "Warm socks");
      checklist.weatherProtection.push("Closed shoes");
      break;
    case "cool":
      checklist.clothing.push("Light jacket", "Light sweater", "Long pants");
      checklist.optional.push("Extra layer for evening");
      break;
    case "hot":
      checklist.clothing.push("Light clothing", "Breathable shirts", "Shorts or light pants");
      checklist.healthAndSafety.push("Reusable water bottle");
      break;
    case "very_hot":
      checklist.clothing.push("Very light clothing", "Breathable shirts", "Light long-sleeve shirt for sun protection");
      checklist.accessories.push("Sunglasses", "Hat or cap");
      checklist.healthAndSafety.push("Sunscreen", "Reusable water bottle", "Electrolytes or hydration support");
      break;
    case "rain":
      checklist.weatherProtection.push("Compact umbrella", "Waterproof jacket");
      checklist.optional.push("Extra socks");
      break;
    case "heavy_rain":
      checklist.weatherProtection.push(
        "Waterproof jacket",
        "Water-resistant shoes",
        "Compact umbrella",
        "Waterproof bag cover"
      );
      checklist.accessories.push("Plastic bag or waterproof pouch for electronics");
      checklist.optional.push("Extra socks", "Quick-dry clothing");
      break;
    case "snow":
      checklist.clothing.push("Warm layers", "Warm socks");
      checklist.weatherProtection.push("Waterproof or insulated shoes", "Waterproof outer layer");
      checklist.accessories.push("Gloves", "Beanie", "Scarf");
      break;
    case "heavy_snow":
      checklist.clothing.push("Heavy coat", "Thermal base layer", "Warm layers");
      checklist.weatherProtection.push("Insulated waterproof shoes", "Waterproof outer layer");
      checklist.accessories.push("Gloves", "Beanie", "Scarf");
      checklist.healthAndSafety.push("Plan extra travel time");
      break;
    case "strong_wind":
      checklist.clothing.push("Layered clothing");
      checklist.weatherProtection.push("Windbreaker jacket");
      checklist.optional.push("Secure hat or cap", "Avoid fragile umbrellas");
      break;
    case "high_uv":
      checklist.accessories.push("Sunglasses", "Hat or cap");
      checklist.healthAndSafety.push("Sunscreen", "Reusable water bottle");
      checklist.clothing.push("Light long-sleeve shirt");
      break;
    case "fog":
      checklist.accessories.push("Reflective accessory");
      checklist.healthAndSafety.push("Plan extra travel time", "Use caution for road travel or outdoor activities");
      break;
    case "storm":
      checklist.weatherProtection.push("Waterproof outer layer");
      checklist.accessories.push("Power bank", "Waterproof pouch for documents or electronics");
      checklist.healthAndSafety.push("Check local alerts before leaving", "Avoid exposed outdoor activities");
      break;
    case "large_temperature_variation":
      checklist.clothing.push("Layered clothing", "Light jacket or removable layer");
      checklist.optional.push("Extra layer for morning or evening");
      break;
    case "mild":
      checklist.clothing.push("Comfortable everyday clothing");
      break;
    case "mixed_conditions":
      checklist.optional.push("Flexible outfit options");
      break;
  }
}

function buildTravelInsights(conditions: DetectedCondition[]) {
  const insights: string[] = [];

  if (conditions.includes("large_temperature_variation")) {
    insights.push("Temperatures may vary significantly during the day, so layered clothing is recommended.");
  }

  if (conditions.includes("mixed_conditions")) {
    insights.push("Weather conditions may vary across the trip, so pack flexible items and layers.");
  }

  if (conditions.includes("storm")) {
    insights.push("Storm risk is inferred from weather codes only; check local official alerts before leaving.");
  }

  if (conditions.includes("heavy_rain")) {
    insights.push("Heavy rain may make walking or commuting less comfortable, so prioritize waterproof items.");
  }

  if (conditions.includes("heavy_snow")) {
    insights.push("Heavy snow may affect travel time, footwear, and outdoor plans.");
  }

  return dedupe(insights);
}

function selectMainScenario(conditions: DetectedCondition[]) {
  const priority: Array<[DetectedCondition, string]> = [
    ["storm", "Storm risk"],
    ["heavy_snow", "Heavy snow"],
    ["heavy_rain", "Heavy rain"],
    ["snow", "Snow expected"],
    ["very_cold", "Very cold weather"],
    ["very_hot", "Very hot weather"],
    ["rain", "Rainy weather"],
    ["strong_wind", "Windy weather"],
    ["high_uv", "High UV"],
    ["cold", "Cold weather"],
    ["hot", "Hot weather"],
    ["cool", "Cool weather"],
    ["mild", "Mild weather"]
  ];

  const match = priority.find(([condition]) => conditions.includes(condition));
  const scenario = match?.[1] ?? "Mild weather";

  if (conditions.includes("mixed_conditions") && scenario !== "Storm risk") {
    return `${scenario} with mixed conditions`;
  }

  return scenario;
}

function buildSummary(mainScenario: string, riskLevel: RiskLevel, conditions: DetectedCondition[]) {
  return `${mainScenario}. Risk level: ${riskLevel}. Detected conditions: ${conditions.join(", ")}.`;
}

function countMajorConditionGroups(conditions: DetectedCondition[]) {
  const groups = new Set<string>();

  for (const condition of conditions) {
    if (["very_cold", "cold", "cool"].includes(condition)) groups.add("cold");
    if (["very_hot", "hot"].includes(condition)) groups.add("hot");
    if (["rain", "heavy_rain"].includes(condition)) groups.add("rain");
    if (["snow", "heavy_snow"].includes(condition)) groups.add("snow");
    if (condition === "strong_wind") groups.add("wind");
    if (condition === "storm") groups.add("storm");
    if (condition === "high_uv") groups.add("uv");
    if (condition === "large_temperature_variation") groups.add("variation");
  }

  return groups.size;
}

function dedupe<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}
