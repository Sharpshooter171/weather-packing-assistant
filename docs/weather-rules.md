# Weather Rules — Weather Packing Assistant

**Project:** Weather Packing Assistant  
**Document status:** Initial deterministic weather rules  
**Version:** 0.1

---

## 1. Purpose

This document defines the deterministic weather interpretation and packing recommendation rules for Weather Packing Assistant.

These rules are the baseline behavior of the product.

The DeepSeek AI layer may improve explanation and organization, but the app must still work when AI is disabled, unavailable, or invalid.

Core principle:

```text
Weather API data -> normalized weather -> detected conditions -> deterministic checklist -> optional AI refinement -> backend validation
```

---

## 2. Why Deterministic Rules Matter

The deterministic rule engine is required because:

- It makes the product testable.
- It keeps the app useful without an LLM.
- It prevents hallucinated weather recommendations.
- It provides a fallback when DeepSeek fails.
- It gives the backend a reference checklist to validate AI output.

The rules should be simple, transparent, and easy to modify.

---

## 3. Normalized Weather Inputs

Rules should run on normalized internal weather data, not raw external API payloads.

Expected normalized fields:

```ts
type NormalizedWeatherSummary = {
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
```

---

## 4. Detected Conditions

The classifier should output one or more detected conditions.

Suggested condition enum:

```ts
type DetectedCondition =
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
```

The final `WeatherProfile.detectedConditions` array should contain these values.

---

## 5. Temperature Rules

### Very Cold

Condition:

```text
minTemperatureC <= 5
```

Detected condition:

```text
very_cold
```

Recommended items:

```text
clothing:
- Heavy coat
- Thermal base layer
- Sweater or hoodie
- Warm socks

weatherProtection:
- Insulated or waterproof shoes

accessories:
- Gloves
- Beanie
- Scarf
```

### Cold

Condition:

```text
minTemperatureC > 5 AND minTemperatureC <= 12
```

Detected condition:

```text
cold
```

Recommended items:

```text
clothing:
- Warm jacket
- Sweater or hoodie
- Long pants
- Warm socks

weatherProtection:
- Closed shoes
```

### Cool

Condition:

```text
minTemperatureC > 12 AND minTemperatureC <= 18
```

Detected condition:

```text
cool
```

Recommended items:

```text
clothing:
- Light jacket
- Light sweater
- Long pants

optional:
- Extra layer for evening
```

### Hot

Condition:

```text
maxTemperatureC >= 28 AND maxTemperatureC < 35
```

Detected condition:

```text
hot
```

Recommended items:

```text
clothing:
- Light clothing
- Breathable shirts
- Shorts or light pants

healthAndSafety:
- Reusable water bottle
- Sunscreen if UV is moderate or high
```

### Very Hot

Condition:

```text
maxTemperatureC >= 35
```

Detected condition:

```text
very_hot
```

Recommended items:

```text
clothing:
- Very light clothing
- Breathable shirts
- Light long-sleeve shirt for sun protection

accessories:
- Sunglasses
- Hat or cap

healthAndSafety:
- Sunscreen
- Reusable water bottle
- Electrolytes or hydration support
```

---

## 6. Rain Rules

### Rain

Condition:

```text
precipitationProbabilityMaxPercent >= 40
OR rainProbabilityMaxPercent >= 40
OR rainSumMaxMm > 0
```

Detected condition:

```text
rain
```

Recommended items:

```text
weatherProtection:
- Compact umbrella
- Waterproof jacket

optional:
- Extra socks
```

### Heavy Rain

Condition:

```text
precipitationProbabilityMaxPercent >= 70
OR rainProbabilityMaxPercent >= 70
OR rainSumMaxMm >= 10
```

Detected condition:

```text
heavy_rain
```

Recommended items:

```text
weatherProtection:
- Waterproof jacket
- Water-resistant shoes
- Compact umbrella
- Waterproof bag cover

accessories:
- Plastic bag or waterproof pouch for electronics

optional:
- Extra socks
- Quick-dry clothing
```

---

## 7. Snow Rules

### Snow

Condition:

```text
snowfallExpected = true
OR snowfallMaxCm > 0
OR weatherCodes include snow-related WMO codes
```

Detected condition:

```text
snow
```

Recommended items:

```text
clothing:
- Warm layers
- Warm socks

weatherProtection:
- Waterproof or insulated shoes
- Waterproof outer layer

accessories:
- Gloves
- Beanie
- Scarf
```

### Heavy Snow

Condition:

```text
snowfallMaxCm >= 5
OR weatherCodes include heavy snow WMO codes
```

Detected condition:

```text
heavy_snow
```

Recommended items:

```text
clothing:
- Heavy coat
- Thermal base layer
- Warm layers

weatherProtection:
- Insulated waterproof shoes
- Waterproof outer layer

accessories:
- Gloves
- Beanie
- Scarf

healthAndSafety:
- Plan extra travel time
```

---

## 8. Wind Rules

### Strong Wind

Condition:

```text
windGustMaxKmh >= 45
OR windSpeedMaxKmh >= 35
```

Detected condition:

```text
strong_wind
```

Recommended items:

```text
clothing:
- Layered clothing

weatherProtection:
- Windbreaker jacket

optional:
- Secure hat or cap
- Avoid fragile umbrellas
```

---

## 9. UV Rules

### High UV

Condition:

```text
uvIndexMax >= 7
```

Detected condition:

```text
high_uv
```

Recommended items:

```text
accessories:
- Sunglasses
- Hat or cap

healthAndSafety:
- Sunscreen
- Reusable water bottle

clothing:
- Light long-sleeve shirt
```

---

## 10. Fog and Visibility Rules

### Fog / Low Visibility

Condition:

```text
visibilityMinMeters <= 1000
OR weatherCodes include fog-related WMO codes
```

Detected condition:

```text
fog
```

Recommended items:

```text
accessories:
- Reflective accessory

healthAndSafety:
- Plan extra travel time
- Use caution for road travel or outdoor activities
```

---

## 11. Storm Rules

### Storm / Thunderstorm Risk

Condition:

```text
weatherCodes include thunderstorm WMO codes
```

Detected condition:

```text
storm
```

Recommended items:

```text
weatherProtection:
- Waterproof outer layer

accessories:
- Power bank
- Waterproof pouch for documents or electronics

healthAndSafety:
- Check local alerts before leaving
- Avoid exposed outdoor activities
```

Important limitation:

```text
The app may infer storm risk from weather codes, but it must not claim official severe weather alerts unless an official alerts API is integrated.
```

---

## 12. Temperature Variation Rules

### Large Temperature Variation

Condition:

```text
temperatureVariationC >= 12
```

Detected condition:

```text
large_temperature_variation
```

Recommended items:

```text
clothing:
- Layered clothing
- Light jacket or removable layer

optional:
- Extra layer for morning or evening
```

Travel insight:

```text
Temperatures may vary significantly during the day, so layered clothing is recommended.
```

---

## 13. Mixed Conditions Rule

Condition:

```text
Three or more major condition groups are detected
```

Examples:

```text
rain + cold + wind
snow + very_cold + wind
hot + high_uv + large_temperature_variation
```

Detected condition:

```text
mixed_conditions
```

Travel insight:

```text
Weather conditions may vary across the trip, so pack flexible items and layers.
```

---

## 14. Weather Code Mapping

The app should maintain a local weather code utility.

Suggested file:

```text
apps/api/src/utils/weatherCodes.ts
```

Suggested mappings:

```ts
const FOG_CODES = [45, 48];
const DRIZZLE_CODES = [51, 53, 55, 56, 57];
const RAIN_CODES = [61, 63, 65, 66, 67, 80, 81, 82];
const SNOW_CODES = [71, 73, 75, 77, 85, 86];
const HEAVY_SNOW_CODES = [75, 86];
const STORM_CODES = [95, 96, 99];
```

The exact mapping should be validated against the selected weather API documentation during implementation.

---

## 15. Risk Level Rules

The system should classify each weather profile into a risk level.

### Low

Condition:

```text
No severe weather condition detected
AND no heavy rain
AND no heavy snow
AND no storm
AND no very hot or very cold condition
```

### Moderate

Condition:

```text
rain
OR cold
OR hot
OR strong_wind
OR high_uv
OR large_temperature_variation
```

### High

Condition:

```text
heavy_rain
OR heavy_snow
OR storm
OR very_hot
OR very_cold with snow or strong wind
```

Risk levels are product guidance only. They are not official safety alerts.

---

## 16. Main Scenario Selection

The main scenario should be short and human-readable.

Examples:

```text
Mild weather
Cool and rainy
Cold and windy
Very cold with snow
Hot with high UV
Storm risk
Mixed conditions
```

Priority order when selecting main scenario:

```text
storm
heavy_snow
heavy_rain
snow
very_cold
very_hot
rain
strong_wind
high_uv
cold
hot
cool
mild
mixed_conditions as modifier when multiple conditions exist
```

---

## 17. De-Duplication Rules

The final checklist must remove duplicates.

Example:

```text
Rain rule adds: Waterproof jacket
Storm rule adds: Waterproof outer layer
```

The checklist validator may keep both if they are meaningfully different, or normalize to one preferred item.

Suggested normalization:

```text
Waterproof outer layer -> Waterproof jacket
Reusable water bottle -> Water bottle
Hat or cap -> Hat or cap
```

---

## 18. Output Contract

The rule engine should output:

```ts
type RuleEngineOutput = {
  weatherProfile: {
    mainScenario: string;
    riskLevel: "low" | "moderate" | "high";
    detectedConditions: DetectedCondition[];
    summary: string;
  };
  travelInsights: string[];
  packingChecklist: {
    clothing: string[];
    weatherProtection: string[];
    accessories: string[];
    healthAndSafety: string[];
    optional: string[];
  };
};
```

---

## 19. Example Outputs

### Example 1 — Cool and Rainy

Input summary:

```json
{
  "minTemperatureC": 12,
  "maxTemperatureC": 18,
  "rainProbabilityMaxPercent": 70,
  "windGustMaxKmh": 38,
  "uvIndexMax": 4,
  "snowfallExpected": false,
  "temperatureVariationC": 6,
  "weatherCodes": [61]
}
```

Output:

```json
{
  "weatherProfile": {
    "mainScenario": "Cool and rainy",
    "riskLevel": "moderate",
    "detectedConditions": ["cool", "rain"],
    "summary": "Cool temperatures with likely rain."
  },
  "travelInsights": [
    "Rain may affect outdoor plans.",
    "A light layer should be useful during cooler periods."
  ],
  "packingChecklist": {
    "clothing": ["Light jacket", "Light sweater", "Long pants"],
    "weatherProtection": ["Compact umbrella", "Waterproof jacket"],
    "accessories": [],
    "healthAndSafety": [],
    "optional": ["Extra socks", "Extra layer for evening"]
  }
}
```

### Example 2 — Snow and Very Cold

Input summary:

```json
{
  "minTemperatureC": -2,
  "maxTemperatureC": 4,
  "snowfallExpected": true,
  "snowfallMaxCm": 6,
  "windGustMaxKmh": 48,
  "temperatureVariationC": 6,
  "weatherCodes": [75]
}
```

Output:

```json
{
  "weatherProfile": {
    "mainScenario": "Very cold with heavy snow",
    "riskLevel": "high",
    "detectedConditions": ["very_cold", "snow", "heavy_snow", "strong_wind"],
    "summary": "Very cold temperatures with heavy snow and strong wind."
  },
  "travelInsights": [
    "Snow and wind may affect outdoor movement.",
    "Warm waterproof layers are recommended.",
    "Plan extra travel time."
  ],
  "packingChecklist": {
    "clothing": ["Heavy coat", "Thermal base layer", "Sweater or hoodie", "Warm socks", "Warm layers"],
    "weatherProtection": ["Insulated waterproof shoes", "Waterproof outer layer", "Windbreaker jacket"],
    "accessories": ["Gloves", "Beanie", "Scarf"],
    "healthAndSafety": ["Plan extra travel time"],
    "optional": []
  }
}
```

---

## 20. Test Cases

The implementation should include tests for:

- Very cold classification
- Cold classification
- Hot classification
- Very hot classification
- Rain classification
- Heavy rain classification
- Snow classification
- Heavy snow classification
- Strong wind classification
- High UV classification
- Fog classification
- Storm classification
- Large temperature variation
- Mixed conditions
- Duplicate removal
- Risk level selection
- Main scenario selection

---

## 21. Implementation Notes

Suggested files:

```text
apps/api/src/services/weatherClassifier.service.ts
apps/api/src/services/packingRules.service.ts
apps/api/src/services/checklistValidator.service.ts
apps/api/src/utils/weatherCodes.ts
```

The weather classifier should not call external APIs.

The packing rules engine should not call DeepSeek.

The checklist validator may compare AI output against this deterministic baseline.

---

## 22. Final Rule

The weather rules are the safety net of the product.

```text
If weather data exists, the app should be able to generate a useful checklist even when AI is unavailable.
```
