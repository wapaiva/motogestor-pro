/**
 * Try to detect the user's city using browser geolocation +
 * OpenStreetMap Nominatim reverse geocoding (free, no API key).
 */
export async function detectCity(): Promise<string | null> {
  if (!("geolocation" in navigator)) return null;

  const position = await new Promise<GeolocationPosition | null>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      () => resolve(null),
      { timeout: 8000, maximumAge: 60_000 }
    );
  });
  if (!position) return null;

  const { latitude, longitude } = position.coords;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=pt-BR`,
      { headers: { Accept: "application/json" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const a = data?.address || {};
    const city =
      a.city || a.town || a.village || a.municipality || a.suburb || a.county || null;
    const state = a.state_code || a.state || "";
    if (!city) return null;
    return state ? `${city} - ${state}` : city;
  } catch {
    return null;
  }
}
