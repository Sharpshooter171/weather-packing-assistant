export type ReverseGeocodedLocation = {
  name: string;
  country: string | null;
  admin1: string | null;
};

type NominatimReverseResponse = {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    region?: string;
    country?: string;
  };
};

const REVERSE_GEOCODING_TIMEOUT_MS = 5_000;

export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodedLocation | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REVERSE_GEOCODING_TIMEOUT_MS);

  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(latitude));
    url.searchParams.set("lon", String(longitude));
    url.searchParams.set("zoom", "10");
    url.searchParams.set("addressdetails", "1");

    const response = await fetch(url, {
      headers: {
        accept: "application/json",
        "accept-language": "en",
        "user-agent": "weather-packing-assistant/0.1 contact:github.com/Sharpshooter171/weather-packing-assistant"
      },
      signal: controller.signal
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as NominatimReverseResponse;
    const address = payload.address;

    if (!address) return null;

    const name =
      address.city ??
      address.town ??
      address.village ??
      address.municipality ??
      address.county ??
      "Current location";
    const admin1 = address.state ?? address.region ?? null;

    return {
      name,
      country: address.country ?? null,
      admin1
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
