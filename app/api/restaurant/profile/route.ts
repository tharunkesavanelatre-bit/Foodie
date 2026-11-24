import { NextRequest, NextResponse, connection } from "next/server";
import { prisma } from "@/lib/prisma";

// Calculate distance between two GPS coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const earthRadius = 6371;

  const toRadians = (degrees: number) =>
    (degrees * Math.PI) / 180;

  const latitudeDifference = toRadians(lat2 - lat1);
  const longitudeDifference = toRadians(lon2 - lon1);

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

// GET - Display nearby approved restaurants
export async function GET(request: NextRequest) {
  await connection();

  try {
    const searchParams = request.nextUrl.searchParams;

    const latitudeParam = searchParams.get("latitude");
    const longitudeParam = searchParams.get("longitude");
    const radiusParam = searchParams.get("radius");

    const hasLatitude = latitudeParam !== null;
    const hasLongitude = longitudeParam !== null;

    if (hasLatitude !== hasLongitude) {
      return NextResponse.json(
        {
          success: false,
          message: "Both latitude and longitude are required.",
        },
        { status: 400 }
      );
    }

    let latitude: number | null = null;
    let longitude: number | null = null;

    if (hasLatitude && hasLongitude) {
      latitude = Number(latitudeParam);
      longitude = Number(longitudeParam);

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
    }

    const radius = radiusParam === null ? 10 : Number(radiusParam);

    if (
      !Number.isFinite(radius) ||
      radius <= 0 ||
      radius > 100
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Radius must be between 0 and 100 kilometres.",
        },
        { status: 400 }
      );
    }

    const restaurants = await prisma.restaurant.findMany({
      where: {
        status: "APPROVED",
        isOpen: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        address: true,
        city: true,
        pincode: true,
        latitude: true,
        longitude: true,
        isOpen: true,
        _count: {
          select: {
            foods: {
              where: {
                isAvailable: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Without customer coordinates, return all open restaurants
    if (latitude === null || longitude === null) {
      return NextResponse.json(
        {
          success: true,
          locationBased: false,
          total: restaurants.length,
          restaurants: restaurants.map((restaurant) => ({
            ...restaurant,
            distanceKm: null,
          })),
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    // Calculate distance and filter restaurants within radius
    const nearbyRestaurants = restaurants
      .filter(
        (restaurant) =>
          restaurant.latitude !== null &&
          restaurant.longitude !== null
      )
      .map((restaurant) => {
        const distanceKm = calculateDistance(
          latitude,
          longitude,
          restaurant.latitude!,
          restaurant.longitude!
        );

        return {
          ...restaurant,
          distanceKm: Number(distanceKm.toFixed(2)),
        };
      })
      .filter((restaurant) => restaurant.distanceKm <= radius)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return NextResponse.json(
      {
        success: true,
        locationBased: true,
        customerLocation: {
          latitude,
          longitude,
        },
        radiusKm: radius,
        total: nearbyRestaurants.length,
        restaurants: nearbyRestaurants,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Public restaurants error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch restaurants.",
      },
      { status: 500 }
    );
  }
}