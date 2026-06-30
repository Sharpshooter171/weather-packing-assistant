const FOG_CODES = new Set([45, 48]);
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);
const HEAVY_SNOW_CODES = new Set([75, 86]);
const STORM_CODES = new Set([95, 96, 99]);

function containsAnyCode(weatherCodes: number[], codeSet: Set<number>) {
  return weatherCodes.some((code) => codeSet.has(code));
}

export function hasFogCode(weatherCodes: number[]) {
  return containsAnyCode(weatherCodes, FOG_CODES);
}

export function hasSnowCode(weatherCodes: number[]) {
  return containsAnyCode(weatherCodes, SNOW_CODES);
}

export function hasHeavySnowCode(weatherCodes: number[]) {
  return containsAnyCode(weatherCodes, HEAVY_SNOW_CODES);
}

export function hasStormCode(weatherCodes: number[]) {
  return containsAnyCode(weatherCodes, STORM_CODES);
}
