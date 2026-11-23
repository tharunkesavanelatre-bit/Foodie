"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Utensils,
  Store,
  RefreshCw,
} from "lucide-react";

import "./RestaurantList.css";

type Restaurant = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  pincode: string | null;
  isOpen: boolean;
  _count: {
    foods: number;
  };
};

export default function RestaurantList() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchRestaurants() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/public/restaurants", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load restaurants.");
      }

      setRestaurants(data.restaurants || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRestaurants();
  }, []);

  return (
    <section className="restaurant-section">
      <div className="restaurant-hero">
        <div className="restaurant-hero-content">
          <span className="restaurant-hero-tag">
            GOOD FOOD, GREAT MOMENTS
          </span>

          <h1>
            Discover restaurants
            <span>you will love.</span>
          </h1>

          <p>
            Explore restaurants, discover their menus, and
            find your next favourite meal with FOODDIE.
          </p>

          <p className="restaurant-hero-note">
            Fresh menus. Great flavours. Easy ordering.
          </p>
        </div>

        <div className="restaurant-hero-visual">
          <div className="hero-food-circle">
            <span>🍕</span>
            <span>🍔</span>
            <span>🍜</span>
            <span>🍱</span>
          </div>
        </div>
      </div>

      <div className="restaurant-heading">
        <span className="restaurant-hero-tag">
          EXPLORE FOOD PARTNERS
        </span>

        <h1>Restaurants near you</h1>

        <p>
          Discover delicious food from our available restaurant partners.
        </p>
      </div>

      {loading && (
        <p className="restaurant-message">
          Loading restaurants...
        </p>
      )}

      {error && (
        <div className="restaurant-message">
          <p>{error}</p>

          <button
            className="restaurant-location-btn"
            onClick={fetchRestaurants}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && restaurants.length === 0 && (
        <div className="restaurant-message">
          <Store size={35} />
          <h2>No restaurants available right now.</h2>
          <p>Please check again later.</p>
        </div>
      )}

      {!loading && !error && restaurants.length > 0 && (
        <div className="restaurant-grid">
          {restaurants.map((restaurant) => (
            <article
              className="restaurant-card"
              key={restaurant.id}
            >
              <div className="restaurant-image">
                🍽️
                <span className="restaurant-hero-tag">
                  OPEN NOW
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

                <p className="restaurant-address">
                  {restaurant._count.foods} menu items available
                </p>

                <Link
                  href={`/restaurants/${restaurant.id}`}
                  className="restaurant-directions"
                >
                  Explore Menu
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}