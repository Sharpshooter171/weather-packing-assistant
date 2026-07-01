import { mapWeatherRequestToApi } from "../mappers/weatherRequest.mapper.js";
import { listAllWeatherRequestsForExport } from "../repositories/weatherRequest.repository.js";

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
