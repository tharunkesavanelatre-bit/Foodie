"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  ShoppingCart,
  Utensils,
} from "lucide-react";

import { useCart } from "@/hooks/useCart";
import { useToast } from "@/components/ui/ToastProvider";

import "./restaurant-menu.css";

type Food = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  image: string | null;
  price: string;
};

type Restaurant = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  pincode: string | null;
  foods: Food[];
};

export default function RestaurantMenuPage() {
  const params = useParams();
  const restaurantId = params.id as string;

  const { addItem } = useCart();
  const { showToast } = useToast();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingFood, setAddingFood] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const response = await fetch(
          `/api/public/restaurants/${restaurantId}`,
          { cache: "no-store" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load restaurant.");
        }

        setRestaurant(data.restaurant);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    if (restaurantId) {
      fetchRestaurant();
    }
  }, [restaurantId]);

  async function handleAddToCart(food: Food) {
    try {
      setAddingFood(food.id);

      await addItem({
        foodId: food.id,
        idMeal: null,
        name: food.name,
        price: `₹${Number(food.price).toFixed(2)}`,
        image: food.image || "",
        category: food.category,
      });

      showToast(
        `${food.name} added to your cart!`,
        "success"
      );
    } catch {
      showToast(
        "Unable to add this item. Please try again.",
        "error"
      );
    } finally {
      setAddingFood(null);
    }
  }

  if (loading) {
    return (
      <main className="restaurant-menu-loading">
        Loading restaurant menu...
      </main>
    );
  }

  if (error || !restaurant) {
    return (
      <main className="restaurant-menu-error">
        <h2>Restaurant unavailable</h2>
        <p>{error || "This restaurant could not be found."}</p>
        <Link href="/restaurants">Back to restaurants</Link>
      </main>
    );
  }

  return (
    <main className="restaurant-menu-page">
      <Link href="/restaurants" className="restaurant-menu-back">
        <ArrowLeft size={18} />
        All Restaurants
      </Link>

      <section className="restaurant-menu-hero">
        <div>
          <span className="restaurant-menu-label">
            Foodie RESTAURANT PARTNER
          </span>

          <h1>{restaurant.name}</h1>

          {restaurant.description && (
            <p>{restaurant.description}</p>
          )}

          <div className="restaurant-menu-location">
            <MapPin size={17} />
            {[
              restaurant.address,
              restaurant.city,
              restaurant.pincode,
            ]
              .filter(Boolean)
              .join(", ") || "Location not provided"}
          </div>

          <span className="restaurant-menu-open">
            ● Open Now
          </span>
        </div>

        <div className="restaurant-menu-hero-icon">
          🍽️
        </div>
      </section>

      <section className="restaurant-menu-content">
        <div className="restaurant-menu-heading">
          <div>
            <span className="restaurant-menu-label">
              MADE WITH FLAVOUR
            </span>

            <h2>Explore the Menu</h2>

            <p>
              Choose your favourites and add them to your cart.
            </p>
          </div>

          <div className="restaurant-menu-count">
            <Utensils size={18} />
            {restaurant.foods.length} Items
          </div>
        </div>

        {restaurant.foods.length === 0 ? (
          <div className="restaurant-menu-empty">
            <Utensils size={35} />
            <h3>Menu coming soon</h3>
            <p>
              This restaurant has not added available food items yet.
            </p>
          </div>
        ) : (
          <div className="restaurant-food-grid">
            {restaurant.foods.map((food) => (
              <article
                className="restaurant-food-card"
                key={food.id}
              >
                <div className="restaurant-food-image">
                  {food.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={food.image} alt={food.name} />
                  ) : (
                    <span>🍲</span>
                  )}
                </div>

                <div className="restaurant-food-info">
                  <span className="restaurant-food-category">
                    {food.category}
                  </span>

                  <h3>{food.name}</h3>

                  {food.description && (
                    <p>{food.description}</p>
                  )}

                  <div className="restaurant-food-bottom">
                    <strong>
                      ₹{Number(food.price).toFixed(2)}
                    </strong>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(food)}
                      disabled={addingFood === food.id}
                    >
                      <ShoppingCart size={16} />

                      {addingFood === food.id
                        ? "Adding..."
                        : "Add"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
