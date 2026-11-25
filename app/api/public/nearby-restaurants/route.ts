import { NextRequest, NextResponse, connection } from "next/server";

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const earthRadius = 6371;

  const toRadians = (value: number) => (value * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const OVERPASS_SERVERS = [
  "https://ovp.dresel.systems/api-as/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

// Try multiple OpenStreetMap servers
async function fetchFromOverpass(query: string) {
  let lastError: unknown;

  for (const server of OVERPASS_SERVERS) {
    try {
      const response = await fetch(server, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "FoodieApp/1.0",
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(20000),
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      console.error(`Overpass server failed: ${server}`, error);
    }
  }

  throw lastError ?? new Error("All Overpass servers are unavailable.");
}

// GET - Find nearby real restaurants
export async function GET(request: NextRequest) {
  await connection();

  try {
    const params = request.nextUrl.searchParams;

    const latitudeParam = params.get("latitude");
    const longitudeParam = params.get("longitude");
    const radiusParam = params.get("radius");

    if (latitudeParam === null || longitudeParam === null) {
      return NextResponse.json(
        {
          success: false,
          message: "Latitude and longitude are required.",
        },
        { status: 400 }
      );
    }

    const latitude = Number(latitudeParam);
    const longitude = Number(longitudeParam);
    const radius = radiusParam === null ? 5000 : Number(radiusParam);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid location coordinates.",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isFinite(radius) ||
      radius < 500 ||
      radius > 25000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Radius must be between 500 and 25000 metres.",
        },
        { status: 400 }
      );
    }

    const query = `
      [out:json][timeout:15];
      (
        node["amenity"~"^(restaurant|fast_food)$"]
          (around:${radius},${latitude},${longitude});

        way["amenity"~"^(restaurant|fast_food)$"]
          (around:${radius},${latitude},${longitude});

        relation["amenity"~"^(restaurant|fast_food)$"]
          (around:${radius},${latitude},${longitude});
      );
      out center;
    `;

    const result = await fetchFromOverpass(query);

    const restaurants = (result.elements ?? [])
      .map((element: {
        id: number;
        type: string;
        lat?: number;
        lon?: number;
        center?: { lat: number; lon: number };
        tags?: Record<string, string>;
      }) => {
        const tags = element.tags ?? {};

        const restaurantLatitude =
          element.lat ?? element.center?.lat;

        const restaurantLongitude =
          element.lon ?? element.center?.lon;

        if (
          typeof restaurantLatitude !== "number" ||
          typeof restaurantLongitude !== "number"
        ) {
          return null;
        }

        const distanceKm = calculateDistance(
          latitude,
          longitude,
          restaurantLatitude,
          restaurantLongitude
        );

        return {
          id: `osm-${element.type}-${element.id}`,
          osmId: element.id,
          name: tags.name ?? "Unnamed restaurant",
          category: tags.amenity,
          cuisine: tags.cuisine ?? null,
          address: [
            tags["addr:housenumber"],
            tags["addr:street"],
            tags["addr:suburb"],
            tags["addr:city"],
            tags["addr:postcode"],
          ]
            .filter(Boolean)
            .join(", ") || null,
          city: tags["addr:city"] ?? null,
          latitude: restaurantLatitude,
          longitude: restaurantLongitude,
          distanceKm: Number(distanceKm.toFixed(2)),
          phone: tags.phone ?? tags["contact:phone"] ?? null,
          website: tags.website ?? tags["contact:website"] ?? null,
          openingHours: tags.opening_hours ?? null,
          source: "OpenStreetMap",
          orderableOnFoodie: false,
        };
      })
      .filter((restaurant: {
        distanceKm: number;
      } | null): restaurant is NonNullable<typeof restaurant> =>
        restaurant !== null
      )
      .sort((a: { distanceKm: number }, b: { distanceKm: number }) =>
        a.distanceKm - b.distanceKm
      );

    return NextResponse.json(
      {
        success: true,
        source: "OpenStreetMap",
        customerLocation: {
          latitude,
          longitude,
        },
        radiusMetres: radius,
        total: restaurants.length,
        restaurants,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Nearby restaurants error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "OpenStreetMap services are temporarily unavailable. Please try again.",
      },
      { status: 503 }
    );
  }
}
