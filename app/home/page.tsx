"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ArrowRight,
  Clock3,
  Star,
  Heart,
  MapPin,
  LocateFixed,
  ExternalLink,
  Phone,
  Globe,
} from "lucide-react";

import HeroSection from "../../components/home/HeroSection";

import "./home.css";

// ==========================================
// TYPES
// ==========================================

interface Recipe {
  id: number;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty: string;
  caloriesPerServing: number;
}

interface RecipeResponse {
  recipes: Recipe[];
  total: number;
  skip: number;
  limit: number;
}

interface NearbyRestaurant {
  id: string;
  osmId: number;
  name: string;
  category: string;
  cuisine: string | null;
  address: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  distanceKm: number;
  phone: string | null;
  website: string | null;
  openingHours: string | null;
  source: string;
  orderableOnFoodie: boolean;
}

interface NearbyRestaurantResponse {
  success: boolean;
  total: number;
  restaurants: NearbyRestaurant[];
  message?: string;
}

// ==========================================
// CATEGORIES
// ==========================================

const categories = [
  {
    name: "Pizza",
    image:
      "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=500",
  },
  {
    name: "Burgers",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
  },
  {
    name: "Biryani",
    image:
      "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=700&q=85",
  },
  {
    name: "Desserts",
    image:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500",
  },
  {
    name: "Salads",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
  },
];

// ==========================================
// HOME PAGE
// ==========================================

export default function HomePage() {
  const [dishes, setDishes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Nearby restaurants
  const [nearbyRestaurants, setNearbyRestaurants] = useState<
    NearbyRestaurant[]
  >([]);

  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState("");
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [restaurantTotal, setRestaurantTotal] = useState(0);

  // ========================================
  // FETCH RECIPES FROM DUMMYJSON
  // ========================================

  useEffect(() => {
    const controller = new AbortController();

    const fetchRecipes = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "https://dummyjson.com/recipes?limit=0",
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Unable to fetch recipes.");
        }

        const data: RecipeResponse = await response.json();

        if (!data.recipes || data.recipes.length === 0) {
          throw new Error("No recipes found.");
        }

        const popularRecipes = [...data.recipes]
          .sort((a, b) => b.rating - a.rating)
          .slice(0, 4);

        setDishes(popularRecipes);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError("Unable to load recipes. Please try again.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchRecipes();

    return () => controller.abort();
  }, []);

  // ========================================
  // FETCH NEARBY RESTAURANTS
  // ========================================

  const fetchNearbyRestaurants = async (
    latitude: number,
    longitude: number
  ) => {
    try {
      setNearbyLoading(true);
      setNearbyError("");
      setNearbyRestaurants([]);

      const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        radius: "5000",
      });

      const response = await fetch(
        `/api/public/nearby-restaurants?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const data: NearbyRestaurantResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to find nearby restaurants."
        );
      }

      setNearbyRestaurants(data.restaurants || []);
      setRestaurantTotal(data.total || 0);
      setLocationEnabled(true);
    } catch (err) {
      setNearbyError(
        err instanceof Error
          ? err.message
          : "Unable to load nearby restaurants."
      );
    } finally {
      setNearbyLoading(false);
    }
  };

  // ========================================
  // GET CUSTOMER LOCATION
  // ========================================

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setNearbyError(
        "Your browser does not support location detection."
      );
      return;
    }

    setNearbyLoading(true);
    setNearbyError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        fetchNearbyRestaurants(latitude, longitude);
      },
      (error) => {
        setNearbyLoading(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setNearbyError(
              "Location permission denied. Please allow location access in your browser."
            );
            break;

          case error.POSITION_UNAVAILABLE:
            setNearbyError(
              "Your current location is unavailable. Please try again."
            );
            break;

          case error.TIMEOUT:
            setNearbyError(
              "Location request timed out. Please try again."
            );
            break;

          default:
            setNearbyError("Unable to detect your location.");
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
  // OPENSTREETMAP LINK
  // ========================================

  const getMapLink = (restaurant: NearbyRestaurant) => {
    return `https://www.openstreetmap.org/?mlat=${restaurant.latitude}&mlon=${restaurant.longitude}#map=18/${restaurant.latitude}/${restaurant.longitude}`;
  };

  return (
    <main className="foodie-home">

      {/* HERO SECTION */}

      <HeroSection />

      {/* ======================================
          NEARBY RESTAURANTS
      ====================================== */}

      <section className="home-section nearby-section">

        <div className="section-heading">

          <div>
            <span className="section-label">
              DISCOVER AROUND YOU
            </span>

            <h2>Restaurants Near You</h2>

            <p>
              Explore real restaurants and food places around your location.
            </p>
          </div>

          <button
            type="button"
            className="nearby-location-button"
            onClick={handleGetLocation}
            disabled={nearbyLoading}
          >
            <LocateFixed size={18} />

            {nearbyLoading
              ? "Finding restaurants..."
              : locationEnabled
                ? "Refresh Location"
                : "Use My Location"}
          </button>

        </div>

        {!locationEnabled && !nearbyLoading && !nearbyError && (
          <div className="nearby-location-prompt">

            <div className="nearby-location-icon">
              <MapPin size={30} />
            </div>

            <h3>Find great food around you</h3>

            <p>
              Allow location access to discover restaurants within 5 km
              of your current location.
            </p>

            <button
              type="button"
              onClick={handleGetLocation}
              className="nearby-location-button"
            >
              <LocateFixed size={17} />
              Detect My Location
            </button>

          </div>
        )}

        {nearbyLoading && (
          <div className="nearby-loading">
            <div className="nearby-spinner" />
            <p>Discovering restaurants around you...</p>
          </div>
        )}

        {nearbyError && (
          <div className="nearby-error">
            <MapPin size={22} />

            <div>
              <strong>Location unavailable</strong>
              <p>{nearbyError}</p>
            </div>

            <button
              type="button"
              onClick={handleGetLocation}
            >
              Try Again
            </button>
          </div>
        )}

        {locationEnabled && !nearbyLoading && (
          <>
            <div className="nearby-results-heading">
              <div>
                <span className="nearby-results-count">
                  {restaurantTotal} places discovered
                </span>

                <p>Restaurants and food places within 5 km</p>
              </div>

              <span className="nearby-source">
                OpenStreetMap
              </span>
            </div>

            {nearbyRestaurants.length === 0 ? (
              <div className="nearby-empty">
                <MapPin size={30} />
                <h3>No restaurants found nearby</h3>
                <p>Try refreshing your location or searching again later.</p>
              </div>
            ) : (
              <div className="nearby-restaurant-grid">

                {nearbyRestaurants.slice(0, 12).map((restaurant) => (
                  <article
                    className="nearby-restaurant-card"
                    key={restaurant.id}
                  >

                    <div className="nearby-card-top">

                      <div className="nearby-card-icon">
                        <MapPin size={23} />
                      </div>

                      <span className="nearby-distance">
                        {restaurant.distanceKm.toFixed(1)} km away
                      </span>

                    </div>

                    <div className="nearby-card-info">

                      <span className="nearby-category">
                        {restaurant.category.replace("_", " ")}
                      </span>

                      <h3>{restaurant.name}</h3>

                      <p className="nearby-cuisine">
                        {restaurant.cuisine
                          ? restaurant.cuisine
                              .split(";")
                              .map((item) =>
                                item.replace(/_/g, " ")
                              )
                              .join(", ")
                          : "Cuisine details unavailable"}
                      </p>

                      {restaurant.address && (
                        <p className="nearby-address">
                          <MapPin size={14} />
                          {restaurant.address}
                        </p>
                      )}

                      {restaurant.openingHours && (
                        <p className="nearby-hours">
                          <Clock3 size={14} />
                          {restaurant.openingHours}
                        </p>
                      )}

                      <div className="nearby-card-actions">

                        <a
                          href={getMapLink(restaurant)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="nearby-map-button"
                        >
                          View Location
                          <ExternalLink size={15} />
                        </a>

                        {restaurant.phone && (
                          <a
                            href={`tel:${restaurant.phone.split(";")[0]}`}
                            className="nearby-phone-button"
                            aria-label={`Call ${restaurant.name}`}
                          >
                            <Phone size={17} />
                          </a>
                        )}

                        {restaurant.website && (
                          <a
                            href={restaurant.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="nearby-phone-button"
                            aria-label={`Visit ${restaurant.name} website`}
                          >
                            <Globe size={17} />
                          </a>
                        )}

                      </div>

                      <span className="nearby-external-label">
                        External listing · Not orderable on FOODIE
                      </span>

                    </div>

                  </article>
                ))}

              </div>
            )}

            <p className="nearby-attribution">
              Restaurant information provided by OpenStreetMap contributors.
            </p>
          </>
        )}

      </section>

      {/* ======================================
          CATEGORIES
      ====================================== */}

      <section className="home-section">

        <div className="section-heading">

          <div>
            <span className="section-label">
              WHAT ARE YOU CRAVING?
            </span>

            <h2>Explore Categories</h2>

            <p>
              Find something delicious for every craving.
            </p>
          </div>

          <Link href="/categories" className="view-all">
            View all <ArrowRight size={17} />
          </Link>

        </div>

        <div className="category-grid">

          {categories.map((category) => (
            <Link
              href="/categories"
              className="category-card"
              key={category.name}
            >

              <div
                className="category-image"
                style={{
                  backgroundImage: `url(${category.image})`,
                }}
              />

              <h3>{category.name}</h3>

            </Link>
          ))}

        </div>

      </section>

      {/* ======================================
          POPULAR DISHES
      ====================================== */}

      <section className="home-section popular-section">

        <div className="section-heading">

          <div>
            <span className="section-label">
              CUSTOMER FAVOURITES
            </span>

            <h2>Popular Right Now</h2>

            <p>
              Delicious picks from our food collection.
            </p>
          </div>

          <Link href="/products" className="view-all">
            Explore menu <ArrowRight size={17} />
          </Link>

        </div>

        {loading && (
          <div className="dish-grid">
            {[1, 2, 3, 4].map((item) => (
              <div className="dish-card" key={item}>
                <div className="dish-image" />
                <div className="dish-info">
                  <p>Loading delicious recipes...</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="dish-error">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="dish-grid">

            {dishes.map((dish) => {

              const totalTime =
                dish.prepTimeMinutes + dish.cookTimeMinutes;

              return (
                <article className="dish-card" key={dish.id}>

                  <div
                    className="dish-image"
                    style={{
                      backgroundImage: `url(${dish.image})`,
                    }}
                  >

                    <span className="dish-offer">
                      {dish.difficulty}
                    </span>

                    <button
                      type="button"
                      className="dish-favourite"
                      aria-label={`Add ${dish.name} to wishlist`}
                    >
                      <Heart size={18} />
                    </button>

                  </div>

                  <div className="dish-info">

                    <div className="dish-title-row">

                      <h3>{dish.name}</h3>

                      <span className="dish-rating">
                        <Star size={14} fill="currentColor" />
                        {dish.rating.toFixed(1)}
                      </span>

                    </div>

                    <p>{dish.cuisine} Cuisine</p>

                    <div className="dish-bottom">

                      <strong>
                        {dish.caloriesPerServing} kcal
                      </strong>

                      <span>
                        <Clock3 size={14} />
                        {totalTime} min
                      </span>

                    </div>

                    <Link
                      href="/products"
                      className="dish-order-button"
                    >
                      View Recipe <ArrowRight size={16} />
                    </Link>

                  </div>

                </article>
              );
            })}

          </div>
        )}

      </section>

      {/* ======================================
          PROMOTIONAL BANNER
      ====================================== */}

      <section className="promo-banner">

        <div>

          <span>YOUR FIRST ORDER IS SPECIAL</span>

          <h2>
            Good food deserves
            <br />
            a great deal.
          </h2>

          <p>
            Enjoy exciting offers on your favourite meals.
          </p>

          <Link href="/products" className="promo-button">
            Order Now <ArrowRight size={17} />
          </Link>

        </div>

        <div className="promo-decoration">
          FOODIE
        </div>

      </section>

      {/* ======================================
          FOOTER
      ====================================== */}

      <footer className="home-footer">

        <Link href="/home" className="home-logo">
          foodie<span>.</span>
        </Link>

        <p>
          Good food. Good mood. Delivered with love.
        </p>

        <span>
          © 2026 Foodie. All rights reserved.
        </span>

      </footer>

    </main>
  );
}