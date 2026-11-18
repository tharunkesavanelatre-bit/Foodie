import { Suspense } from "react";
import AddToCartButton from "@/features/cart/components/AddToCartButton";
import WishlistButton from "@/features/wishlist/components/WishlistButton";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, Sparkles } from "lucide-react";
import { foods } from "@/data/foods";

type Props = {
  params: Promise<{ slug: string }>;
};

async function FoodDetails({ params }: Props) {
  const { slug } = await params;

  const food = foods.find(
    (item) =>
      item.name.toLowerCase().replace(/\s+/g, "-") === slug
  );

  if (!food) notFound();

  const foodId = slug;

  return (
    <main className="food-details-page">
      <div className="food-details-container">
        <Link href="/products" className="food-back-link">
          <ArrowLeft size={18} />
          Back to Products
        </Link>

        <div className="food-details-card">
          <div className="food-details-image">
            <img src={food.image} alt={food.name} />

            <span className="food-details-tag">
              <Sparkles size={15} />
              {food.tag}
            </span>
          </div>

          <div className="food-details-info">
            <span className="food-details-category">
              {food.category}
            </span>

            <h1>{food.name}</h1>

            <div className="food-details-rating">
              <Star size={18} fill="currentColor" />
              <strong>{food.rating}</strong>
              <span>Food Rating</span>
            </div>

            <div className="food-details-divider" />

            <span className="food-details-price-label">
              Deliciousness starts at
            </span>

            <p className="food-details-price">{food.price}</p>

            <p className="food-details-description">
              Discover delicious flavours and enjoy this delicious
              food selection from FOODDIE.
            </p>

            <div className="food-details-actions">
              <AddToCartButton
                name={food.name}
                price={food.price}
                image={food.image}
              />

              <WishlistButton
                id={foodId}
                name={food.name}
                price={food.price}
                image={food.image}
                category={food.category}
              />

              <Link href="/products" className="food-details-explore">
                Explore More Foods
              </Link>
            </div>

            <div className="food-details-note">
              Made for food lovers. Enjoy every bite!
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function FoodDetailsPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="food-details-page" />}>
      <FoodDetails params={params} />
    </Suspense>
  );
}