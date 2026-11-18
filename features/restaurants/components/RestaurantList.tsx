"use client";

import { useState } from "react";
import "./RestaurantList.css";

type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  latitude: number;
  longitude: number;
  address: string;
};

export default function RestaurantList() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  function getDistance(lat: number, lon: number) {
    if (!userLocation) return "";

    const toRadians = (value: number) => (value * Math.PI) / 180;
    const earthRadius = 6371;

    const dLat = toRadians(lat - userLocation.latitude);
    const dLon = toRadians(lon - userLocation.longitude);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRadians(userLocation.latitude)) *
        Math.cos(toRadians(lat)) *
        Math.sin(dLon / 2) ** 2;

    const distance =
      2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return distance < 1
      ? `${Math.round(distance * 1000)} m away`
      : `${distance.toFixed(1)} km away`;
  }

  function findNearbyRestaurants() {
    setLoading(true);
    setError("");
    setRestaurants([]);

    if (!navigator.geolocation) {
      setError("Location is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        setUserLocation({ latitude, longitude });

        try {
          const response = await fetch(
            `/api/restaurants?lat=${latitude}&lon=${longitude}&radius=5000`
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || "Unable to fetch restaurants.");
          }

          setRestaurants(data.restaurants || []);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : "Unable to load restaurants."
          );
        } finally {
          setLoading(false);
        }
      },
      (locationError) => {
        setError(locationError.message);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
    );
  }

  return (
    <section className="restaurant-section">
      {/* HERO SECTION */}
      <div className="restaurant-hero">
        <div className="restaurant-hero-content">
          <span className="restaurant-hero-tag">
            GOOD FOOD. GREAT PLACES.
          </span>

          <h1>
            Find Your Next
            <span> Favourite Restaurant.</span>
          </h1>

          <p>
            Discover amazing restaurants around you. Explore local favourites
            and find your next delicious experience.
          </p>

          <button
            className="restaurant-location-btn"
            onClick={findNearbyRestaurants}
            disabled={loading}
          >
            {loading
              ? "Finding Restaurants..."
              : "Explore Nearby Restaurants →"}
          </button>

          <div className="restaurant-hero-note">
            <span>📍</span> Discover restaurants near your location
          </div>
        </div>

        <div className="restaurant-hero-visual">
          <div className="hero-food-circle">
            <span>🍔</span>
            <span>🍕</span>
            <span>🍜</span>
            <span>🥗</span>
          </div>
        </div>
      </div>

      {/* RESTAURANT LIST */}
      <div className="restaurant-heading">
        <h2>Restaurants Near You</h2>
        <p>Explore delicious places waiting to be discovered.</p>
      </div>

      {error && <p className="restaurant-message">{error}</p>}

      {restaurants.length > 0 && (
        <p className="restaurant-message">
          Found {restaurants.length} nearby restaurants.
        </p>
      )}

      <div className="restaurant-grid">
        {restaurants.map((restaurant) => (
          <article className="restaurant-card" key={restaurant.id}>
            <div className="restaurant-image">🍽️</div>

            <div className="restaurant-info">
              <h3>{restaurant.name}</h3>

              <span className="restaurant-cuisine">
                {restaurant.cuisine}
              </span>

              <p className="restaurant-address">{restaurant.address}</p>

              <p className="restaurant-distance">
                📍 {getDistance(restaurant.latitude, restaurant.longitude)}
              </p>

              <a
                className="restaurant-directions"
                href={`https://www.google.com/maps/dir/?api=1&destination=${restaurant.latitude},${restaurant.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Directions →
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}