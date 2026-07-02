import type { ApiSuccess, WeatherRequest } from "../types/weather";

const DEFAULT_API_BASE_URL = "http://localhost:4000";

export type CreateWeatherRequestPayload = {
  location: string;
  latitude?: number;
  longitude?: number;
  startDate: string;
  endDate: string;
  useAi?: boolean;
};

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${baseUrl}${normalizedPath}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers
    }
  });

  const payload = (await response.json()) as T;

  if (!response.ok) {
    throw payload;
  }

  return payload;
}

export function createWeatherRequest(payload: CreateWeatherRequestPayload) {
  return apiFetch<ApiSuccess<WeatherRequest>>("/api/weather-requests", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
