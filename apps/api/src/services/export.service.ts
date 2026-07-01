import { mapWeatherRequestToApi } from "../mappers/weatherRequest.mapper.js";
import { listAllWeatherRequestsForExport } from "../repositories/weatherRequest.repository.js";

type ExportedWeatherRequest = ReturnType<typeof mapWeatherRequestToApi>;

const CSV_HEADERS = [
  "id",
  "locationInput",
  "resolvedLocationName",
  "country",
  "latitude",
  "longitude",
  "startDate",
  "endDate",
  "currentTemperatureC",
  "currentCondition",
  "forecastSummary",
  "weatherProfileMainScenario",
  "weatherProfileRiskLevel",
  "weatherProfileDetectedConditions",
  "weatherProfileSummary",
  "travelInsights",
  "packingClothing",
  "packingWeatherProtection",
  "packingAccessories",
  "packingHealthAndSafety",
  "packingOptional",
  "aiStatus",
  "createdAt",
  "updatedAt"
] as const;

export async function buildWeatherRequestsJsonExport() {
  const records = await listAllWeatherRequestsForExport();

  return {
    data: records.map(mapWeatherRequestToApi),
    meta: {
      count: records.length,
      exportedAt: new Date().toISOString()
    }
  };
}

export async function buildWeatherRequestsCsvExport() {
  const records = await listAllWeatherRequestsForExport();
  const exportedRecords = records.map(mapWeatherRequestToApi);
  const rows = exportedRecords.map(buildCsvRow);

  return [CSV_HEADERS.join(","), ...rows].join("\n") + "\n";
}

function buildCsvRow(record: ExportedWeatherRequest) {
  const values: Record<(typeof CSV_HEADERS)[number], string | number | null> = {
    id: record.id,
    locationInput: record.locationInput,
    resolvedLocationName: record.resolvedLocationName,
    country: record.country,
    latitude: record.latitude,
    longitude: record.longitude,
    startDate: record.startDate,
    endDate: record.endDate,
    currentTemperatureC: record.currentWeather?.temperatureC ?? null,
    currentCondition: record.currentWeather?.condition ?? null,
    forecastSummary: buildForecastSummary(record.forecast),
    weatherProfileMainScenario: record.weatherProfile?.mainScenario ?? null,
    weatherProfileRiskLevel: record.weatherProfile?.riskLevel ?? null,
    weatherProfileDetectedConditions: joinList(record.weatherProfile?.detectedConditions),
    weatherProfileSummary: record.weatherProfile?.summary ?? null,
    travelInsights: joinList(record.travelInsights),
    packingClothing: joinList(record.packingChecklist?.clothing),
    packingWeatherProtection: joinList(record.packingChecklist?.weatherProtection),
    packingAccessories: joinList(record.packingChecklist?.accessories),
    packingHealthAndSafety: joinList(record.packingChecklist?.healthAndSafety),
    packingOptional: joinList(record.packingChecklist?.optional),
    aiStatus: record.aiStatus,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt
  };

  return CSV_HEADERS.map((header) => escapeCsvValue(values[header])).join(",");
}

function buildForecastSummary(forecast: ExportedWeatherRequest["forecast"]) {
  if (!Array.isArray(forecast) || forecast.length === 0) return "";

  return forecast
    .map((day) => {
      const condition = day.condition ? ` ${day.condition}` : "";
      const temperatureRange =
        typeof day.minTemperatureC === "number" && typeof day.maxTemperatureC === "number"
          ? ` ${day.minTemperatureC}-${day.maxTemperatureC}C`
          : "";

      return `${day.date}${condition}${temperatureRange}`.trim();
    })
    .join(" | ");
}

function joinList(value: unknown) {
  return Array.isArray(value) ? value.join(" | ") : "";
}

function escapeCsvValue(value: string | number | null) {
  if (value === null) return "";

  const normalizedValue = String(value);
  const mustQuote = /[",\n\r]/.test(normalizedValue);
  const escapedValue = normalizedValue.replaceAll('"', '""');

  return mustQuote ? `"${escapedValue}"` : escapedValue;
}
