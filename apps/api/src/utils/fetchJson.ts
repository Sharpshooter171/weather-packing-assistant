import { AppError } from "../errors/AppError.js";

export async function fetchJson(url: URL, timeoutMs: number): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        accept: "application/json"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new AppError("WEATHER_API_ERROR", "Weather provider returned an error response.", 502, {
        status: response.status,
        statusText: response.statusText
      });
    }

    return response.json();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("WEATHER_API_ERROR", "Unable to fetch weather provider data.", 502);
  } finally {
    clearTimeout(timeout);
  }
}
