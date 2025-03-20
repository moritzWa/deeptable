import { cityMapping } from 'city-timezones';

export interface NormalizedLocation {
  city: string | null;
  province: string | null;
  country: string | null;
  timezone: string | null;
}

export function normalizeLocation(location: string | null): NormalizedLocation {
  if (!location) {
    return {
      city: null,
      province: null,
      country: null,
      timezone: null,
    };
  }

  // Clean up the input
  const cleanLocation = location
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  // Try to find the city in the database
  const cityResults = cityMapping.filter((city) => {
    const searchStr = cleanLocation.toLowerCase();
    const cityStr = city.city.toLowerCase();

    // Check if the location contains the city name
    // or if the city name contains the location (for cases like "SF" matching "San Francisco")
    return searchStr.includes(cityStr) || cityStr.includes(searchStr);
  });

  if (cityResults.length > 0) {
    // Sort by population to get the most likely match
    const bestMatch = cityResults.sort((a, b) => (b.pop || 0) - (a.pop || 0))[0];

    return {
      city: bestMatch.city,
      province: bestMatch.province || bestMatch.state_ansi || null,
      country: bestMatch.country,
      timezone: bestMatch.timezone,
    };
  }

  // If no match found, try to extract location parts
  const parts = cleanLocation.split(/,\s*/);

  if (parts.length >= 2) {
    return {
      city: parts[0] || null,
      province: parts.length > 2 ? parts[1] : null,
      country: parts[parts.length - 1] || null,
      timezone: null,
    };
  }

  // If all else fails, just store the city
  return {
    city: cleanLocation || null,
    province: null,
    country: null,
    timezone: null,
  };
}

// Add explicit module marker
export {};
