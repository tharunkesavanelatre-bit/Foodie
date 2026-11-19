import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";

export async function GET(request: NextRequest) {
  await connection();

  try {
    const { searchParams } = new URL(request.url);

    const lat = Number(searchParams.get("lat"));
    const lon = Number(searchParams.get("lon"));

    const radius = Math.min(
      Math.max(Number(searchParams.get("radius")) || 5000, 1000),
      10000
    );

    const apiKey = process.env.GEOAPIFY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { message: "Geoapify API key is missing." },
        { status: 500 }
      );
    }

    if (
      !searchParams.has("lat") ||
      !searchParams.has("lon") ||
      !Number.isFinite(lat) ||
      !Number.isFinite(lon) ||
      lat < -90 ||
      lat > 90 ||
      lon < -180 ||
      lon > 180
    ) {
      return NextResponse.json(
        { message: "Valid location is required." },
        { status: 400 }
      );
    }

    const params = new URLSearchParams({
      categories: "catering.restaurant,catering.cafe,catering.fast_food",
      filter: `circle:${lon},${lat},${radius}`,
      bias: `proximity:${lon},${lat}`,
      limit: "100",
      lang: "en",
      apiKey,
    });

    const response = await fetch(
      `https://api.geoapify.com/v2/places?${params}`,
      {
        signal: AbortSignal.timeout(15000),
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      console.error("Geoapify error:", response.status);

      return NextResponse.json(
        { message: "Unable to retrieve restaurant data." },
        { status: response.status === 401 ? 401 : 503 }
      );
    }

    const data = await response.json();

    const restaurants = (data.features || []).map((item: any) => {
      const place = item.properties;

      return {
        id: place.place_id,
        name: place.name || "Unnamed Restaurant",
        cuisine: place.catering?.cuisine || "Various",
        type:
          place.categories?.find((category: string) =>
            category.startsWith("catering.")
          ) || "catering",
        latitude: place.lat,
        longitude: place.lon,
        address: place.formatted || "",
        phone: place.contact?.phone || null,
        website: place.contact?.website || null,
        openingHours: place.opening_hours || null,
      };
    });

    return NextResponse.json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    console.error("Restaurant API Error:", error);

    return NextResponse.json(
      { message: "Unable to fetch nearby restaurants." },
      { status: 500 }
    );
  }
}