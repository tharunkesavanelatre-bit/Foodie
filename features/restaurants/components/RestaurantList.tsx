"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  MapPin,
  Utensils,
  Store,
  RefreshCw,
  Sparkles,
  Star,
  Heart,
  Bike,
  Navigation,
  LocateFixed,
  AlertCircle,
} from "lucide-react";

import "./RestaurantList.css";

// ==========================================
// TYPES
// ==========================================

type Restaurant = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  pincode: string | null;
  isOpen: boolean;
  latitude?: number | null;
  longitude?: number | null;
  _count: {
    foods: number;
  };
};

type NearbyRestaurant = Restaurant & {
  distance: number | null;
};

// ==========================================
// HERO FOOD IMAGES
// ==========================================

const heroFoods = [
  {
    name: "Fresh Food Bowl",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=85",
  },
  {
    name: "Pizza",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=85",
  },
  {
    name: "Burger",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=85",
  },
  {
    name: "Pasta",
    image:
      "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&q=85",
  },
  {
    name: "Fresh Salad",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=85",
  },
];

// ==========================================
// DISTANCE CALCULATION
// ==========================================

function calculateDistance(
  userLatitude: number,
  userLongitude: number,
  restaurantLatitude: number,
  restaurantLongitude: number
): number {
  const earthRadius = 6371;

  const toRadians = (degrees: number) =>
    (degrees * Math.PI) / 180;

  const latitudeDifference = toRadians(
    restaurantLatitude - userLatitude
  );

  const longitudeDifference = toRadians(
    restaurantLongitude - userLongitude
  );

  const a =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(userLatitude)) *
      Math.cos(toRadians(restaurantLatitude)) *
      Math.sin(longitudeDifference / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function RestaurantList() {
  const [restaurants, setRestaurants] = useState<NearbyRestaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationEnabled, setLocationEnabled] = useState(false);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // ========================================
  // FETCH RESTAURANTS
  // ========================================

  const fetchRestaurants = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/public/restaurants", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load restaurants."
        );
      }

      setRestaurants(
        (data.restaurants || []).map((restaurant: Restaurant) => ({
          ...restaurant,
          distance: null,
        }))
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ========================================
  // GET USER LOCATION
  // ========================================

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Your browser does not support location detection."
      );
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setUserLocation({
          latitude,
          longitude,
        });

        setLocationEnabled(true);
        setLocationLoading(false);
      },
      (locationError) => {
        setLocationLoading(false);
        setLocationEnabled(false);

        switch (locationError.code) {
          case locationError.PERMISSION_DENIED:
            setLocationError(
              "Location permission denied. Please allow location access in your browser."
            );
            break;

          case locationError.POSITION_UNAVAILABLE:
            setLocationError(
              "Your current location is unavailable."
            );
            break;

          case locationError.TIMEOUT:
            setLocationError(
              "Location request timed out. Please try again."
            );
            break;

          default:
            setLocationError(
              "Unable to detect your location."
            );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  // ========================================
  // INITIAL FETCH
  // ========================================

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  // ========================================
  // CALCULATE NEARBY RESTAURANTS
  // ========================================

  useEffect(() => {
    if (!userLocation) return;

    setRestaurants((previousRestaurants) => {
      return previousRestaurants
        .map((restaurant) => {
          const hasCoordinates =
            typeof restaurant.latitude === "number" &&
            typeof restaurant.longitude === "number" &&
            Number.isFinite(restaurant.latitude) &&
            Number.isFinite(restaurant.longitude) &&
            restaurant.latitude >= -90 &&
            restaurant.latitude <= 90 &&
            restaurant.longitude >= -180 &&
            restaurant.longitude <= 180;

          if (!hasCoordinates) {
            return {
              ...restaurant,
              distance: null,
            };
          }

          return {
            ...restaurant,
            distance: calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              restaurant.latitude!,
              restaurant.longitude!
            ),
          };
        })
        .sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;

          return a.distance - b.distance;
        });
    });
  }, [userLocation]);

  // ========================================
  // RENDER
  // ========================================

  return (
    <section className="restaurant-section overflow-hidden">

      {/* ======================================
          HERO SECTION
      ====================================== */}

      <div className="restaurant-hero relative isolate overflow-hidden">

        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">

          <div className="absolute -left-24 top-10 h-72 w-72 animate-[restaurantFloat_9s_ease-in-out_infinite] rounded-full bg-orange-300/20 blur-3xl" />

          <div className="absolute -right-20 bottom-0 h-80 w-80 animate-[restaurantFloat_11s_ease-in-out_infinite_reverse] rounded-full bg-amber-300/20 blur-3xl" />

          <div className="absolute right-1/3 top-0 h-48 w-48 animate-pulse rounded-full bg-orange-200/20 blur-3xl" />

        </div>

        {/* CENTERED HERO CONTENT */}

        <div className="restaurant-hero-content relative z-10">

          <span className="restaurant-hero-tag inline-flex items-center gap-2 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg">

            <Sparkles size={16} className="animate-pulse" />

            GOOD FOOD, GREAT MOMENTS

          </span>

          <h1>
            Discover restaurants

            <span className="block bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              you will love.
            </span>
          </h1>

          <p>
            Explore restaurants, discover their menus, and
            find your next favourite meal with Foodie.
          </p>

          <div className="restaurant-hero-note group relative mt-6 inline-flex overflow-hidden rounded-full border border-orange-200/70 bg-white/70 px-5 py-3 text-sm font-medium text-orange-700 shadow-sm backdrop-blur-md transition-all duration-500 hover:-translate-y-1 hover:scale-105 hover:border-orange-400 hover:shadow-xl">

            <span className="relative z-10">
              Fresh menus. Great flavours. Easy ordering.
            </span>

            <span className="pointer-events-none absolute inset-0 -translate-x-full animate-[restaurantShimmer_4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />

          </div>

          <div className="restaurant-hero-highlights mt-8 flex flex-wrap gap-5">

            <div className="flex items-center gap-2 text-sm text-gray-600 transition-transform duration-300 hover:-translate-y-1">

              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <Star size={17} />
              </span>

              Great flavours

            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 transition-transform duration-300 hover:-translate-y-1">

              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <Bike size={17} />
              </span>

              Easy ordering

            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 transition-transform duration-300 hover:-translate-y-1">

              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <Heart size={17} />
              </span>

              Made with love

            </div>

          </div>

        </div>

        {/* CONTINUOUS FOOD IMAGE ANIMATION */}

        <div className="restaurant-food-marquee">

          <div className="restaurant-marquee-track">

            {[0, 1].map((group) => (

              <div
                className="restaurant-marquee-group"
                key={group}
                aria-hidden={group === 1}
              >

                {heroFoods.map((food) => (

                  <div
                    className="restaurant-marquee-card"
                    key={food.name}
                  >

                    <div className="restaurant-marquee-image">

                      <Image
                        src={food.image}
                        alt={food.name}
                        fill
                        sizes="220px"
                        className="object-cover"
                      />

                    </div>

                    <span>{food.name}</span>

                  </div>

                ))}

              </div>

            ))}

          </div>

        </div>

      </div>

      {/* ======================================
          RESTAURANT HEADING
      ====================================== */}

      <div className="restaurant-heading">

        <span className="restaurant-hero-tag">
          <Sparkles size={15} />
          EXPLORE FOOD PARTNERS
        </span>

        <h1>Restaurants near you</h1>

        <p>
          Discover delicious food from our available restaurant partners.
        </p>

      </div>

      {/* ======================================
          LOCATION DETECTION
      ====================================== */}

      <div className="restaurant-location-panel">

        <div className="restaurant-location-content">

          <div className="restaurant-location-icon">
            <Navigation size={22} />
          </div>

          <div>
            <h3>
              {locationEnabled
                ? "Your location detected"
                : "Find restaurants near you"}
            </h3>

            <p>
              {locationEnabled
                ? "Restaurants are sorted by distance when coordinates are available."
                : "Enable your location to find the closest restaurant partners."}
            </p>
          </div>

        </div>

        <button
          type="button"
          className="restaurant-location-btn transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          onClick={detectLocation}
          disabled={locationLoading}
        >

          {locationLoading ? (
            <RefreshCw size={17} className="animate-spin" />
          ) : (
            <LocateFixed size={17} />
          )}

          {locationLoading
            ? "Detecting..."
            : locationEnabled
              ? "Refresh Location"
              : "Use My Location"}

        </button>

      </div>

      {/* LOCATION ERROR */}

      {locationError && (
        <div className="restaurant-location-error">

          <AlertCircle size={17} />

          <span>{locationError}</span>

        </div>
      )}

      {/* LOCATION SUMMARY */}

      {locationEnabled && userLocation && (
        <div className="restaurant-location-summary">

          <MapPin size={16} />

          Location successfully detected.

          <span>
            {restaurants.filter((r) => r.distance !== null).length} restaurants with location data.
          </span>

        </div>
      )}

      {/* ======================================
          LOADING
      ====================================== */}

      {loading && (
        <div className="restaurant-message">

          <RefreshCw
            className="mx-auto mb-3 animate-spin text-orange-500"
            size={30}
          />

          <p>Loading restaurants...</p>

        </div>
      )}

      {/* ======================================
          ERROR
      ====================================== */}

      {!loading && error && (
        <div className="restaurant-message">

          <p>{error}</p>

          <button
            type="button"
            className="restaurant-location-btn transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            onClick={fetchRestaurants}
          >

            <RefreshCw size={16} />

            Try Again

          </button>

        </div>
      )}

      {/* ======================================
          EMPTY STATE
      ====================================== */}

      {!loading && !error && restaurants.length === 0 && (
        <div className="restaurant-message">

          <Store size={35} />

          <h2>No restaurants available right now.</h2>

          <p>Please check again later.</p>

        </div>
      )}

      {/* ======================================
          RESTAURANT GRID
      ====================================== */}

      {!loading && !error && restaurants.length > 0 && (
        <div className="restaurant-grid">

          {restaurants.map((restaurant, index) => (

            <article
              className="restaurant-card group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
              key={restaurant.id}
              style={{
                animation: "restaurantCardReveal 0.7s ease both",
                animationDelay: `${index * 100}ms`,
              }}
            >

              <div className="restaurant-image relative overflow-hidden">

                <span className="restaurant-hero-tag">
                  {restaurant.isOpen ? "OPEN NOW" : "CLOSED"}
                </span>

              </div>

              <div className="restaurant-info">

                <h2>{restaurant.name}</h2>

                <p className="restaurant-cuisine">
                  <Utensils size={13} />
                  Restaurant Partner
                </p>

                {restaurant.description && (
                  <p className="restaurant-address">
                    {restaurant.description}
                  </p>
                )}

                <p className="restaurant-address">

                  <MapPin size={15} />

                  {[
                    restaurant.address,
                    restaurant.city,
                    restaurant.pincode,
                  ]
                    .filter(Boolean)
                    .join(", ") || "Address not provided"}

                </p>

                {/* DISTANCE */}

                {restaurant.distance !== null && (
                  <p className="restaurant-distance">

                    <Navigation size={14} />

                    {restaurant.distance < 1
                      ? `${Math.round(restaurant.distance * 1000)} m away`
                      : `${restaurant.distance.toFixed(1)} km away`}

                  </p>
                )}

                <p className="restaurant-address">
                  {restaurant._count.foods} menu items available
                </p>

                <Link
                  href={`/restaurants/${restaurant.id}`}
                  className="restaurant-directions group/link transition-all duration-300 hover:gap-4"
                >

                  Explore Menu

                  <ArrowRight
                    size={16}
                    className="transition-transform duration-300 group-hover/link:translate-x-1"
                  />

                </Link>

              </div>

            </article>

          ))}

        </div>
      )}

    </section>
  );
}
